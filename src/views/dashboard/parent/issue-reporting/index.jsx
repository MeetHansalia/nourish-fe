'use client'

// React Imports
import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { getSession } from 'next-auth/react'

// MUI Imports
import { Grid, Card, Box, CircularProgress, Button } from '@mui/material'

// Third-party Imports
import InfiniteScroll from 'react-infinite-scroll-component'

// Util Imports
import axiosApiCall from '@utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'
import { API_ROUTER } from '@/utils/apiRoutes'

// View Imports
import Reports from '@/views/dashboard/parent/issue-reporting/Reports'
import DetailForm from '@/views/dashboard/parent/issue-reporting/DetailForm'
import { toastError, actionConfirmWithLoaderAlert, successAlert } from '@/utils/globalFunctions'

/**
 * Page
 */
const IssueReporting = props => {
  // Props
  const { dictionary = null } = props
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [issueCounts, setIssueCount] = useState(0)
  const [kidData, setKidData] = useState([])
  const [staticIssues, setStaticIssues] = useState([])
  const [role, setRole] = useState('')

  const router = useRouter()

  // HOOKS
  const { lang: locale } = useParams()

  /**
   * Axios Test: Start
   */
  // Get Issue Count
  const getIssueCount = async () => {
    await axiosApiCall
      .get(API_ROUTER?.PARENT?.ISSUE_REPORTING_COUNT)
      .then(response => {
        setIssueCount(response?.data?.response?.countIssues)
      })
      .catch(error => {
        toastError(error?.response?.message)
      })
  }

  const getChildren = async () => {
    await axiosApiCall
      .get(API_ROUTER?.PARENT?.GET_CHILDREN)
      .then(response => {
        console.log('response: child', response)

        setKidData(response?.data?.response?.kidData)
      })
      .catch(error => {
        toastError(error?.response?.message)
      })
  }

  const getStaticIssues = async () => {
    await axiosApiCall
      .get(API_ROUTER?.PARENT?.GET_STATIC_ISSUES)
      .then(response => {
        console.log('response: ', response)

        setStaticIssues(response?.data?.response?.issueData)
      })
      .catch(error => {
        toastError(error?.response?.message)
      })
  }

  /** Axios Test: End */

  /**
   * Page Life Cycle: Start
   */
  useEffect(() => {
    getRole()
    getIssueCount()
    getStaticIssues()
  }, [])

  useEffect(() => {
    if (role === 'parent_role') {
      getChildren()
    }
  }, [role])

  /** Page Life Cycle: End */

  //Functions

  const refreshData = () => {
    getIssueCount()
  } // refresh data

  const getRole = async () => {
    const session = await getSession()
    const userRole = session?.user?.role || ''

    setRole(userRole)
  } // getRole: End

  return (
    <div>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Reports dictionary={dictionary} issueCounts={issueCounts} role={role} />
        </Grid>
        <Grid item xs={12}>
          {role && (
            <DetailForm
              dictionary={dictionary}
              kidData={kidData}
              staticIssues={staticIssues}
              refreshData={refreshData}
              role={role}
            />
          )}
        </Grid>
      </Grid>
    </div>
  )
}

export default IssueReporting
