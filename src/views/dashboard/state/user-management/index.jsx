'use client'

// React Imports
import { useEffect, useMemo, useRef, useState } from 'react'

// Next Imports
import { useParams, usePathname, useRouter } from 'next/navigation'

// MUI Imports
import { Grid, Card, Box, CircularProgress, Button } from '@mui/material'

// Third-party Imports
import InfiniteScroll from 'react-infinite-scroll-component'
import { isCancel } from 'axios'
import { getSession, useSession } from 'next-auth/react'
import { useSelector } from 'react-redux'

// Util Imports
import axiosApiCall from '@utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import {
  toastError,
  actionConfirmWithLoaderAlert,
  successAlert,
  getPanelName,
  apiResponseErrorHandling,
  fetchUserProfileAndUpdateStoreValue,
  isUserHasPermission
} from '@/utils/globalFunctions'
import { ITEMS_PER_PAGE, USER_ROLE_TO_PANEL_MAPPING } from '@/utils/constants'

// View Imports
import Statistics from '@/views/dashboard/state/user-management/Statistics'
import UserCard from '@/views/dashboard/state/user-management/UserCard'

// Server Action Imports
import { navigate } from '@/app/server/actions'

// Redux Imports
import { profileState } from '@/redux-store/slices/profile'

/**
 * Page
 */
const UserManagement = props => {
  // Props
  const { dictionary = null } = props

  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, update } = useSession()
  const { user = null } = useSelector(profileState)

  // Vars
  const panelName = getPanelName(pathname)

  // User Operation Permissions
  const userOperationPermissions = useMemo(
    () => ({
      users_list: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'user_management',
        subPermissionsToCheck: ['get_users']
      }),
      suspended_users_list: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'user_management',
        subPermissionsToCheck: ['get_suspend_users']
      }),
      create_user: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'user_management',
        subPermissionsToCheck: ['create_user']
      }),
      update_user: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'user_management',
        subPermissionsToCheck: ['update_user']
      }),
      delete_user: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'user_management',
        subPermissionsToCheck: ['delete_user']
      }),
      suspend_user: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'user_management',
        subPermissionsToCheck: ['suspend_users']
      }),
      access_user: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'user_management',
        subPermissionsToCheck: ['access_user']
      }),
      get_user_details: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'user_management',
        subPermissionsToCheck: ['get_user_details']
      })
    }),
    [user?.permissions]
  )

  /**
   * Statistic: Start
   */
  const [isLoadingStatistic, setIsLoadingStatistic] = useState(false)
  const [suspendedAccountNumbers, setSuspendedAccountNumber] = useState()

  const getTotalSuspendedAccountNumber = async () => {
    setIsLoadingStatistic(true)
    await axiosApiCall
      .get(API_ROUTER.STATE_USER.STATISTIC)
      .then(response => {
        setSuspendedAccountNumber(response?.data?.response?.suspended_accounts)
        setIsLoadingStatistic(false)
      })
      .catch(error => {
        setIsLoadingStatistic(false)
        toastError(error?.response?.message)
      })
  }
  /** Statistic: End */

  /**
   * User Listing: Start
   */
  const [isGetUsersLoading, setIsGetUsersLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const pageRef = useRef(1)
  const hasMoreRef = useRef(true)
  const itemsPerPage = ITEMS_PER_PAGE
  const getUsersController = useRef()

  const getUsers = async (fnInput = null) => {
    const { isNeedToUpdateWholeList = false } = fnInput || {}

    if (isGetUsersLoading && !isNeedToUpdateWholeList) {
      return
    }

    setIsGetUsersLoading(true)

    if (getUsersController.current) {
      getUsersController.current?.abort()
    }

    getUsersController.current = new AbortController()

    const apiCallParams = {
      page: pageRef.current,
      limit: itemsPerPage
    }

    if (isNeedToUpdateWholeList) {
      const pageLastUsed = pageRef.current - (hasMoreRef.current ? 1 : 0) || 1

      apiCallParams.page = 1
      apiCallParams.limit = pageLastUsed * itemsPerPage
    }

    await axiosApiCall
      .get(API_ROUTER.STATE_USER.ALL_USERS, {
        signal: getUsersController?.current?.signal,
        params: apiCallParams
      })
      .then(response => {
        const responseBody = response?.data
        const usersData = responseBody?.response?.users || []

        if (usersData?.length === 0) {
          setHasMore(false)
          hasMoreRef.current = false
        } else {
          if (isNeedToUpdateWholeList) {
            setUsers(usersData)
          } else {
            setUsers(prevUsers => [...prevUsers, ...usersData])
            setPage(prevPage => prevPage + 1)
            pageRef.current++
          }
        }

        setIsGetUsersLoading(false)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsGetUsersLoading(false)

          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }

  useEffect(() => {
    if (userOperationPermissions?.users_list) {
      getUsers()
    }
  }, [userOperationPermissions?.users_list])
  /** User Listing: End */

  /**
   * Suspend User: Start
   */
  const handleSuspendUser = userId => {
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for suspending user
         */
        deleteUrl: `${API_ROUTER.STATE_USER.SPECIFIC_USER_WITH_ID(userId)}/status`,
        requestMethodType: 'PUT',
        title: `${dictionary?.sweet_alert?.user_suspend?.title}`,
        text: `${dictionary?.sweet_alert?.user_suspend?.text}`,
        customClass: {
          confirmButton: `btn bg-warning`
        },
        requestInputData: {
          status: 'suspended'
        }
      },
      {
        confirmButtonText: `${dictionary?.sweet_alert?.user_suspend?.confirm_button}`,
        cancelButtonText: `${dictionary?.sweet_alert?.user_suspend?.cancel_button}`
      },
      (callbackStatus, result) => {
        /**
         * Callback after action confirmation
         */
        if (callbackStatus) {
          setUsers(prevUsers => prevUsers?.filter(user => user?._id !== userId))

          getTotalSuspendedAccountNumber()
          getUsers({ isNeedToUpdateWholeList: true })

          successAlert({
            title: `${dictionary?.sweet_alert?.user_suspend?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.user_suspend?.ok}`
          })
        }
      }
    )
  }
  /** Suspend User: End */

  /**
   * Delete User: Start
   */
  const handleDeleteUser = userId => {
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for deleting user
         */
        deleteUrl: `${API_ROUTER.STATE_USER.SPECIFIC_USER_WITH_ID(userId)}`,
        requestMethodType: 'DELETE',
        title: `${dictionary?.sweet_alert?.user_delete?.title}`,
        text: `${dictionary?.sweet_alert?.user_delete?.text}`,
        customClass: {
          confirmButton: `btn bg-error`
        }
      },
      {
        confirmButtonText: `${dictionary?.sweet_alert?.user_delete?.confirm_button}`,
        cancelButtonText: `${dictionary?.sweet_alert?.user_delete?.cancel_button}`
      },
      (callbackStatus, result) => {
        /**
         * Callback after action confirmation
         */
        if (callbackStatus) {
          setUsers(prevUsers => prevUsers?.filter(user => user?._id !== userId))

          getUsers({ isNeedToUpdateWholeList: true })

          successAlert({
            title: `${dictionary?.sweet_alert?.user_delete?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.user_delete?.ok}`
          })
        }
      }
    )
  }
  /** Delete User: End */

  /**
   * User access: Start
   */
  const [isGetUserAccessLoading, setIsGetUserAccessLoading] = useState(false)
  const isGetUserAccessLoadingRef = useRef(false)
  const getUserAccessController = useRef()

  const userAccessHandler = async (id = null) => {
    if (isGetUserAccessLoadingRef?.current) {
      return
    }

    const sessionData = await getSession()

    if (!sessionData?.access_token) {
      return
    }

    isGetUserAccessLoadingRef.current = true
    setIsGetUserAccessLoading(true)

    if (getUserAccessController.current) {
      getUserAccessController.current?.abort()
    }

    getUserAccessController.current = new AbortController()

    axiosApiCall
      .get(API_ROUTER.STATE_USER.GET_ACCESS_USER(id), {
        signal: getUserAccessController?.current?.signal
      })
      .then(async response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        const originalAuth = {
          access_token: sessionData?.access_token
        }

        const userAccess = {
          user: responseBodyData?.userData,
          access_token: responseBodyData?.access_token
        }

        if (!sessionData?.originalAuth) {
          userAccess.originalAuth = originalAuth
        }

        try {
          await update({ userAccess: userAccess }) // Update session data
          const updatedSession = await getSession() // Refresh session cache

          await fetchUserProfileAndUpdateStoreValue()

          const userRole = updatedSession?.user?.role || ''
          const userPanel = USER_ROLE_TO_PANEL_MAPPING[userRole] || ''
          const redirectURL = `/${locale}/${userPanel}`

          navigate({ url: redirectURL })
        } catch (error) {
          console.error('Failed to update session:', error)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsGetUserAccessLoading(false)
          isGetUserAccessLoadingRef.current = false

          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }
  /** User access: End */

  // useEffect(() => {
  //   console.log('userOperationPermissions: ', userOperationPermissions)
  // }, [userOperationPermissions])

  // useEffect(() => {
  //   console.log('userOperationPermissions?.users_list: ', userOperationPermissions?.users_list)
  // }, [userOperationPermissions?.users_list])

  /**
   * Page Life Cycle: Start
   */
  useEffect(() => {
    getTotalSuspendedAccountNumber()
  }, [])
  /** Page Life Cycle: End */

  return (
    <div>
      <div className='manage-user-block'>
        <div className='manage-user-block-left'>
          <Statistics
            dictionary={dictionary}
            suspendedAccountNumbers={suspendedAccountNumbers}
            isLoadingStatistic={isLoadingStatistic}
            userOperationPermissions={userOperationPermissions}
          />
        </div>
        {userOperationPermissions?.create_user && (
          <div className='manage-user-block-right'>
            <Button
              className='theme-common-btn min-width-auto'
              variant='contained'
              onClick={() => router.push(`/${locale}/${panelName}/user-management/user-create`)}
            >
              {dictionary?.page?.user_management?.create_user?.create_user}
            </Button>
          </div>
        )}
      </div>

      {userOperationPermissions?.users_list && (
        <Grid container spacing={6}>
          <Grid item xs={12}>
            {isGetUsersLoading && page === 1 ? (
              <div className='text-center'>
                <CircularProgress />
              </div>
            ) : (
              <InfiniteScroll
                dataLength={users?.length}
                next={getUsers}
                hasMore={hasMore}
                loader={
                  isGetUsersLoading ? (
                    <Box className='flex justify-center items-center h-[100px]'>
                      <CircularProgress />
                    </Box>
                  ) : null
                }
                endMessage={
                  <Box className={`text-center p-2 ${users?.length === 0 ? 'mt-10' : ''}`}>
                    <b>{dictionary?.common?.no_more_data_to_load}</b>
                  </Box>
                }
              >
                <Grid container spacing={7} className='two-block-card-common'>
                  {users?.map(user => (
                    <Grid key={user._id} item xs={12} sm={12} md={6}>
                      <Card className='two-block-card-common-inner w-full p-0'>
                        <UserCard
                          user={user}
                          dictionary={dictionary}
                          handleSuspendUser={handleSuspendUser}
                          handleDeleteUser={handleDeleteUser}
                          userAccessHandler={userAccessHandler}
                          isGetUserAccessLoading={isGetUserAccessLoading}
                          userOperationPermissions={userOperationPermissions}
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </InfiniteScroll>
            )}
          </Grid>
        </Grid>
      )}
    </div>
  )
}

export default UserManagement
