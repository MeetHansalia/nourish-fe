'use client'

// React Imports
import { useMemo, useState } from 'react'

import { useSelector } from 'react-redux'

// MUI Imports
import { Grid } from '@mui/material'

// Util Imports
import { isUserHasPermission } from '@/utils/globalFunctions'

// Redux Imports
import { profileState } from '@/redux-store/slices/profile'
import Statistics from './Statistics'
import LocationSelectorForm from './LocationSelectorForm'
import OrderDataTable from './OrderDataTable'
import ManageVendorRequest from './last-moment-cancellation/ManageVendorRequestTable'

/**
 * Page
 */
const OrderManagement = props => {
  // Hooks
  const { dictionary = null } = props

  const { user = null } = useSelector(profileState)

  const [showDropDdown, setShowDropDown] = useState({
    last_moment_cancellation: true,
    meal_monitoring: false
  })

  const isUserHasPermissionSections = useMemo(
    () => ({
      get_last_movement_cancellation_list: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'order_management',
        subPermissionsToCheck: ['get_last_movement_cancellation_list']
      }),
      change_order: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'order_management',
        subPermissionsToCheck: ['change_order']
      })
    }),
    [user?.permissions]
  )

  return (
    <Grid container spacing={6}>
      {isUserHasPermissionSections?.get_last_movement_cancellation_list && (
        <Grid item xs={6} sm={2} md={12}>
          <Statistics dictionary={dictionary} setShowDropDown={setShowDropDown} showDropDdown={showDropDdown} />
          <ManageVendorRequest dictionary={dictionary} />
          {/* {showDropDdown.last_moment_cancellation && <ManageVendorRequest dictionary={dictionary} />}
          {showDropDdown.meal_monitoring && (
            <LocationSelectorForm dictionary={dictionary} showButton={true} spacing={4} lg={6} />
          )} */}
        </Grid>
      )}
    </Grid>
  )
}

export default OrderManagement
