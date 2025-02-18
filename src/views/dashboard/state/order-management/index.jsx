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
  const [showDropDdown, setShowDropDown] = useState(false)

  const isUserHasPermissionSections = useMemo(
    () => ({
      order_tracking: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'order_management',
        subPermissionsToCheck: ['order_tracking']
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
      {isUserHasPermissionSections?.order_tracking && (
        <Grid item xs={6} sm={2} md={12}>
          <Statistics dictionary={dictionary} setShowDropDown={setShowDropDown} showDropDdown={showDropDdown} />
          {!showDropDdown && <ManageVendorRequest dictionary={dictionary} />}
          {showDropDdown && <LocationSelectorForm dictionary={dictionary} showButton={true} spacing={4} lg={6} />}
        </Grid>
      )}
    </Grid>
  )
}

export default OrderManagement
