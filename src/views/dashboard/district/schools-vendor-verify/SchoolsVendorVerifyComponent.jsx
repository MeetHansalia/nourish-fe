'use client'

import { useEffect, useState } from 'react'

import { useSelector } from 'react-redux'

import { Grid } from '@mui/material'

import Statistics from './Statistics'
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { toastError, isUserHasPermission } from '@/utils/globalFunctions'
import SchoolRegistrationRequestsTable from './school-registration-request/SchoolRegistrationRequestsTable'

import { profileState } from '@/redux-store/slices/profile'

const SchoolsVendorVerifyComponent = props => {
  const { dictionary = null } = props
  const { user = null } = useSelector(profileState)

  // User Operation Permissions
  const userOperationPermissions = useMemo(
    () => ({
      verification_requests: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'user_management',
        subPermissionsToCheck: ['verification_requests']
      })
    }),
    [user?.permissions]
  )

  return (
    <Grid container spacing={2}>
      {/* {isUserHasPermissionSections?.order_tracking && ( */}
      <Grid item xs={6} sm={2} md={12}>
        <Statistics dictionary={dictionary} />
        {userOperationPermissions.verification_requests && <SchoolRegistrationRequestsTable dictionary={dictionary} />}
      </Grid>
      {/* )} */}
    </Grid>
  )
}

export default SchoolsVendorVerifyComponent
