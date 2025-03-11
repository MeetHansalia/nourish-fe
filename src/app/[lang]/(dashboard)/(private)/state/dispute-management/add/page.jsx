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

import { toastError, actionConfirmWithLoaderAlert, successAlert } from '@/utils/globalFunctions'
import DisputeForm from '@/views/dashboard/state/dispute-management/DisputeForm'

/**
 * Page
 */
const DisputeAdd = props => {
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

  /** Axios Test: End */

  /**
   * Page Life Cycle: Start
   */
  useEffect(() => {
    // getRole()
    // getIssueCount()
    // getStaticIssues()
  }, [])

  // useEffect(() => {
  //   if (role === 'parent_role') {
  //     getChildren()
  //   }
  // }, [role])

  /** Page Life Cycle: End */

  //Functions

  const refreshData = () => {
    // getIssueCount()
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
          <DisputeForm
            dictionary={dictionary}
            kidData={kidData}
            staticIssues={staticIssues}
            refreshData={refreshData}
            role={role}
          />
        </Grid>
      </Grid>
    </div>
  )
}

export default DisputeAdd
