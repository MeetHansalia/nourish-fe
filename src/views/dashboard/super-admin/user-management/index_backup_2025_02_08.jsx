'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import { useParams, usePathname, useRouter } from 'next/navigation'

// MUI Imports
import { Grid, Card, Box, CircularProgress, Button } from '@mui/material'

// Third-party Imports
import InfiniteScroll from 'react-infinite-scroll-component'
import { isCancel } from 'axios'
import { getSession, useSession } from 'next-auth/react'

// Util Imports
import axiosApiCall from '@utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'
import { API_ROUTER } from '@/utils/apiRoutes'

// View Imports
import Statistics from '@/views/dashboard/super-admin/user-management/Statistics'
import UserCard from './UserCard'
import {
  toastError,
  actionConfirmWithLoaderAlert,
  successAlert,
  getPanelName,
  apiResponseErrorHandling,
  fetchUserProfileAndUpdateStoreValue
} from '@/utils/globalFunctions'
import { USER_ROLE_TO_PANEL_MAPPING } from '@/utils/constants'
import { navigate } from '@/app/server/actions'

/**
 * Page
 */
const UserManagement = props => {
  // Props
  const { dictionary = null } = props

  // HOOKS
  const { lang: locale } = useParams()
  const [allUsers, setAllUsers] = useState([])
  const [suspendedAccountNumbers, setSuspendedAccountNumber] = useState()
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, update } = useSession()

  // Vars
  const panelName = getPanelName(pathname)

  const [isLoadingStatistic, setIsLoadingStatistic] = useState(false)

  /**
   * Axios Test: Start
   */
  // List All User
  const getAllUsers = (currentPage, perPage) => {
    setLoading(true)

    axiosApiCall
      .get(API_ROUTER.SUPER_ADMIN_USER.ALL_USERS, {
        params: {
          page: currentPage,
          limit: perPage
        }
      })
      .then(response => {
        const responseBody = response?.data
        const usersData = responseBody?.response?.users || []
        const totalPages = responseBody?.meta?.totalPage || 0

        if (usersData.length === 0 || currentPage >= totalPages) {
          setHasMore(false)
        }

        setAllUsers(prevUsers => {
          const existingUsers = new Map(prevUsers.map(user => [user._id, user]))

          const newUsers = usersData.filter(user => !existingUsers.has(user._id))

          return [...prevUsers, ...newUsers]
        })
        // setAllUsers(prevUsers => [...prevUsers, ...new Map([...usersData].map(item => [item._id, item])).values()])/
        setLoading(false)
      })
      .catch(error => {
        toastError(error?.response?.message)
        setLoading(false)
      })
  }

  const handleResize = () => {
    const width = window.innerWidth
    const height = window.innerHeight

    if (width >= 1200) {
      setItemsPerPage(Math.floor(height / 300))
    } else if (width >= 600) {
      setItemsPerPage(Math.floor(height / 300))
    } else {
      setItemsPerPage(Math.floor(height / 300))
    }
  }

  // Suspend User
  const handleSuspendUser = userId => {
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for suspending user
         */
        deleteUrl: `${API_ROUTER.SUPER_ADMIN_USER.SPECIFIC_USER_WITH_ID(userId)}/status`,
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
          getTotalSuspendedAccountNumber()

          setAllUsers(prevUsers => prevUsers.filter(user => user._id !== userId))

          successAlert({
            title: `${dictionary?.sweet_alert?.user_suspend?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.user_suspend?.ok}`
          })
          // getAllUsers(page, itemsPerPage)
        }
      }
    )
  }

  // Delete User
  const handleDeleteUser = userId => {
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for deleting user
         */
        deleteUrl: `${API_ROUTER.SUPER_ADMIN_USER.SPECIFIC_USER_WITH_ID(userId)}`,
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
          // getAllUsers(page, itemsPerPage)
          setAllUsers(prevUsers => prevUsers.filter(user => user._id !== userId))
          successAlert({
            title: `${dictionary?.sweet_alert?.user_delete?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.user_delete?.ok}`
          })
        }
      }
    )
  }

  const getTotalSuspendedAccountNumber = async () => {
    setIsLoadingStatistic(true)
    await axiosApiCall
      .get(API_ROUTER.SUPER_ADMIN_USER.STATISTIC)
      .then(response => {
        setSuspendedAccountNumber(response?.data?.response?.suspended_accounts)
        setIsLoadingStatistic(false)
      })
      .catch(error => {
        setIsLoadingStatistic(false)
        toastError(error?.response?.message)
      })
  }

  /** Axios Test: End */

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
      .get(API_ROUTER.SUPER_ADMIN_USER.GET_ACCESS_USER(id), {
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

          // console.log('updatedSession: ', updatedSession)

          await fetchUserProfileAndUpdateStoreValue()

          const userRole = updatedSession?.user?.role || ''
          const userPanel = USER_ROLE_TO_PANEL_MAPPING[userRole] || ''
          const redirectURL = `/${locale}/${userPanel}`

          navigate({ url: redirectURL })
        } catch (error) {
          console.error('Failed to update session:', error)
        }

        // setIsGetUserAccessLoading(false)
        // isGetUserAccessLoadingRef.current = false
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

  /**
   * Page Life Cycle: Start
   */
  useEffect(() => {
    getAllUsers(page, itemsPerPage)
    getTotalSuspendedAccountNumber()
    // getLocalizedUrl('/user-management', locale)
    // getLocalizedUrl(`/${panelName}/user-management`, locale)
    // handleResize();
    // window.addEventListener('resize', handleResize)

    return () => {
      // window.removeEventListener('resize', handleResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  // useEffect(() => {
  //   getTotalSuspendedAccountNumber()
  // }, [suspendedAccountNumbers])

  /** Page Life Cycle: End */

  return (
    <div>
      <div className='manage-user-block'>
        <div className='manage-user-block-left'>
          <Statistics
            dictionary={dictionary}
            suspendedAccountNumbers={suspendedAccountNumbers}
            isLoadingStatistic={isLoadingStatistic}
          />
        </div>
        <div className='manage-user-block-right'>
          <Button
            className='theme-common-btn min-width-auto'
            variant='contained'
            onClick={() => router.push(`/${locale}/${panelName}/user-management/user-create`)}
          >
            {dictionary?.page?.user_management?.create_user?.create_user}
          </Button>
        </div>
      </div>

      <Grid container spacing={6}>
        <Grid item xs={12}>
          {loading && page === 1 ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px'
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <InfiniteScroll
              dataLength={allUsers.length}
              next={() => {
                setPage(prevPage => {
                  const nextPage = prevPage + 1

                  getAllUsers(nextPage, itemsPerPage)

                  return nextPage
                })
              }}
              hasMore={hasMore}
              loader={
                loading ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100px'
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : null
              }
              endMessage={
                <Box sx={{ textAlign: 'center', padding: 2 }}>
                  <b>No more users to load</b>
                </Box>
              }
            >
              {/* <div className='two-block-card-common'>
                {allUsers?.map(item => (
                  <Card key={item._id} className='two-block-card-common-inner'>
                    <UserCard
                      user={item}
                      dictionary={dictionary}
                      handleSuspendUser={handleSuspendUser}
                      handleDeleteUser={handleDeleteUser}
                      userAccessHandler={userAccessHandler}
                      isGetUserAccessLoading={isGetUserAccessLoading}
                    />
                  </Card>
                ))}
              </div> */}
              <Grid container spacing={7} className='two-block-card-common'>
                {allUsers?.map(item => (
                  <Grid key={item._id} item xs={12} sm={12} md={6}>
                    <Card className='two-block-card-common-inner w-full p-0'>
                      <UserCard
                        user={item}
                        dictionary={dictionary}
                        handleSuspendUser={handleSuspendUser}
                        handleDeleteUser={handleDeleteUser}
                        userAccessHandler={userAccessHandler}
                        isGetUserAccessLoading={isGetUserAccessLoading}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </InfiniteScroll>
          )}
        </Grid>
      </Grid>
    </div>
  )
}

export default UserManagement
