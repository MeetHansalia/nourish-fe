'use client'

// React Imports
import { useEffect, useMemo } from 'react'

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

  /**
   * Temp code: Start
   */
  // useEffect(() => {
  //   console.log('user?.permissions: ', user?.permissions)
  // }, [user?.permissions])

  // useEffect(() => {
  //   console.log('isUserHasPermissionSections: ', isUserHasPermissionSections)
  // }, [isUserHasPermissionSections])
  /** Temp code: End */

  return (
    <Grid container spacing={6}>
      {isUserHasPermissionSections?.order_tracking && (
        <Grid item xs={12} md={6}>
          Section 2: order_tracking
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
