'use client'

import { useEffect, useState } from 'react'

import { Grid } from '@mui/material'

import Statistics from './Statistics'
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { toastError } from '@/utils/globalFunctions'
import SchoolRegistrationRequestsTable from './school-registration-request/SchoolRegistrationRequestsTable'

const SchoolsVendorVerifyComponent = props => {
  const { dictionary = null } = props

  return (
    <Grid container spacing={2}>
      {/* {isUserHasPermissionSections?.order_tracking && ( */}
      <Grid item xs={6} sm={2} md={12}>
        <Statistics dictionary={dictionary} />
        <SchoolRegistrationRequestsTable dictionary={dictionary} />
      </Grid>
      {/* )} */}
    </Grid>
  )
}

export default SchoolsVendorVerifyComponent
