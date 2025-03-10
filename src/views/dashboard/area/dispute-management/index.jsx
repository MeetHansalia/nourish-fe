'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { getSession } from 'next-auth/react'

// MUI Imports
import { Grid, Card, Box, CircularProgress, Button } from '@mui/material'

// Third-party Imports
import InfiniteScroll from 'react-infinite-scroll-component'

import { useSelector } from 'react-redux'

// Util Imports
import axiosApiCall from '@utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'
import { API_ROUTER } from '@/utils/apiRoutes'

// View Imports
import DetailForm from '@/views/dashboard/parent/issue-reporting/DetailForm'
import { toastError, actionConfirmWithLoaderAlert, successAlert, isUserHasPermission } from '@/utils/globalFunctions'

import DisputeListManagement from './DisputeList'

import { profileState } from '@/redux-store/slices/profile'
import Reports from './Reports'

/**
 * Page
 */
const DisputeReporting = props => {
  // Props
  const { dictionary = null } = props
  const [disputeCounts, setDisputeCount] = useState(0)
  const [role, setRole] = useState('')
  const [isLoadingStatistic, setIsLoadingStatistic] = useState(false)

  const router = useRouter()
  const { user = null } = useSelector(profileState)

  // HOOKS
  const { lang: locale } = useParams()

  // Vars
  const isUserHasPermissionSections = useMemo(
    () => ({
      get_dispute_list: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'dispute_management',
        subPermissionsToCheck: ['get_dispute_list']
      })
    }),
    [user?.permissions]
  )

  /**
   * Axios Test: Start
   */
  // Get Issue Count
  const getDisputeCounts = async () => {
    const apiUrl = `${API_ROUTER?.ADMIN?.ISSUE_REPORTING_COUNT}?status=Warned`

    setIsLoadingStatistic(true)

    await axiosApiCall
      .get(apiUrl)
      .then(response => {
        setIsLoadingStatistic(false)

        setDisputeCount(response?.data?.response?.countIssues)
      })
      .catch(error => {
        setIsLoadingStatistic(false)

        toastError(error?.response?.message)
      })
  }

  /** Axios Test: End */

  /**
   * Page Life Cycle: Start
   */
  useEffect(() => {
    getRole()

    {
      isUserHasPermissionSections?.get_dispute_list && getDisputeCounts()
    }
  }, [])

  /** Page Life Cycle: End */

  //Functions

  const getRole = async () => {
    const session = await getSession()
    const userRole = session?.user?.role || ''

    setRole(userRole)
  } // getRole: End

  return (
    <div>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Reports
            dictionary={dictionary}
            isDispute={true}
            issueCounts={disputeCounts}
            role={role}
            disabled
            isLoadingStatistic={isLoadingStatistic}
          />
        </Grid>
        <Grid item xs={12}>
          {isUserHasPermissionSections?.get_dispute_list && (
            <DisputeListManagement dictionary={dictionary} refreshCounts={getDisputeCounts} />
          )}
        </Grid>
      </Grid>
    </div>
  )
}

export default DisputeReporting
