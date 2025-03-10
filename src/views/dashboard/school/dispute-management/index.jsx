'use client'

// React Imports
import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { getSession } from 'next-auth/react'

// MUI Imports
import { Grid } from '@mui/material'

// Util Imports
import axiosApiCall from '@utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'

// View Imports
import { toastError } from '@/utils/globalFunctions'

import DisputeListManagement from './DisputeList'
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
    getDisputeCounts()
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
          <DisputeListManagement dictionary={dictionary} refreshCounts={getDisputeCounts} />
        </Grid>
      </Grid>
    </div>
  )
}

export default DisputeReporting
