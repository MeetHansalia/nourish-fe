'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// Third-party Imports
import { useSelector } from 'react-redux'

// MUI Imports
import { Grid } from '@mui/material'

// Util Imports
import { isUserHasPermission } from '@/utils/globalFunctions'

// Redux Imports
import { profileState } from '@/redux-store/slices/profile'
import Statistics from './Statistics'
import VendorRegistrationRequestsTable from './VendorRequestTable'

/**
 * Page
 */
const OrderManagement = props => {
  // Hooks
  const { dictionary = null } = props

  const { user = null } = useSelector(profileState)

  // Vars
  const isUserHasPermissionSections = useMemo(
    () => ({
      users_list: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'user_management',
        subPermissionsToCheck: ['get_users']
      }),
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
        {isUserHasPermissionSections?.verification_requests && <Statistics dictionary={dictionary} />}
        {isUserHasPermissionSections?.users_list && <VendorRegistrationRequestsTable dictionary={dictionary} />}
      </Grid>
      {/* )} */}
    </Grid>
  )
}

export default OrderManagement
