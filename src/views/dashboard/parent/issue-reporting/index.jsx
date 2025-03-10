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
import Reports from '@/views/dashboard/parent/issue-reporting/Reports'
import DetailForm from '@/views/dashboard/parent/issue-reporting/DetailForm'
import { toastError } from '@/utils/globalFunctions'

/**
 * Page
 */
const IssueReporting = props => {
  // Props
  const { dictionary = null } = props
  const [issueCounts, setIssueCount] = useState(0)
  const [kidData, setKidData] = useState([])
  const [staticIssues, setStaticIssues] = useState([])
  const [role, setRole] = useState('')

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
        setStaticIssues(response?.data?.response?.issueData)
      })
      .catch(error => {
        toastError(error?.response?.message)
      })
  }

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
        <Grid item xs={12} className='pt-0'>
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
