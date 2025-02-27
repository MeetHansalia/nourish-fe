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
  // const isUserHasPermissionSections = useMemo(
  //   () => ({
  //     order_tracking: isUserHasPermission({
  //       permissions: user?.permissions,
  //       permissionToCheck: 'order_management',
  //       subPermissionsToCheck: ['order_tracking']
  //     }),
  //     change_order: isUserHasPermission({
  //       permissions: user?.permissions,
  //       permissionToCheck: 'order_management',
  //       subPermissionsToCheck: ['change_order']
  //     })
  //   }),
  //   [user?.permissions]
  // )

  return (
    <Grid container spacing={2}>
      {/* {isUserHasPermissionSections?.order_tracking && ( */}
      <Grid item xs={6} sm={2} md={12}>
        <Statistics dictionary={dictionary} />

        <VendorRegistrationRequestsTable dictionary={dictionary} />
      </Grid>
      {/* )} */}
    </Grid>
  )
}

export default OrderManagement
