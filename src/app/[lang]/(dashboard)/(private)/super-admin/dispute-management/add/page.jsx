'use client'

// React Imports
import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { getSession } from 'next-auth/react'

// MUI Imports
import { Grid } from '@mui/material'

import DisputeForm from '@/views/dashboard/super-admin/dispute-management/DisputeForm'

/**
 * Page
 */
const DisputeAdd = props => {
  // Props
  const { dictionary = null } = props
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
