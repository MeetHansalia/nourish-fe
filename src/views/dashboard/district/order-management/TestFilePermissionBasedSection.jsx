'use client'

// React Imports
import { useMemo } from 'react'

// Third-party Imports
import { useSelector } from 'react-redux'

// MUI Imports
import { Grid } from '@mui/material'

// Util Imports
import { isUserHasPermission } from '@/utils/globalFunctions'

// Redux Imports
import { profileState } from '@/redux-store/slices/profile'

/**
 * Page
 */
const TestFilePermissionBasedSection = props => {
  // Hooks
  const { dictionary = null } = props

  const { user = null } = useSelector(profileState)

  // Vars
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
        <Grid item xs={12} md={6}>
          Section 1: order_tracking
        </Grid>
      )}
      {isUserHasPermissionSections?.change_order && (
        <Grid item xs={12} md={6}>
          Section 2: change_order
        </Grid>
      )}
    </Grid>
  )
}

export default TestFilePermissionBasedSection
