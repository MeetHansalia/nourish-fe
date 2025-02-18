// React Imports
import { useEffect, useMemo } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// Third-party Imports
import { useSelector } from 'react-redux'

// Component Imports
import { MenuItem } from '@menu/vertical-menu'

// Util Imports
import { USER_PANELS } from '@/utils/constants'
import { isUserHasPermission } from '@/utils/globalFunctions'

// Redux Imports
import { profileState } from '@/redux-store/slices/profile'

/**
 * Page
 */
const VerticalMenuAdmin = ({ dictionary, userRole, userPanel }) => {
  // Hooks
  const params = useParams()
  const { user = null } = useSelector(profileState)

  // Vars
  const { lang: locale } = params

  const isUserHasPermissionNavigation = useMemo(
    () => ({
      order_management: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'order_management',
        // subPermissionsToCheck: [],
        subPermissionsToCheck: ['order_tracking', 'change_order']
      }),
      user_management: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'user_management',
        subPermissionsToCheck: ['get_users', 'create_user', 'get_suspend_users']
      })
    }),
    [user?.permissions]
  )

  const disputeResolutionPath = `/${locale}/${userPanel}/dispute-management`

  /**
   * Temp code: Start
   */
  // const isUserHasPermissionNavigation = {
  //   order_management: isUserHasPermission({
  //     permissions: user?.permissions,
  //     permissionToCheck: 'order_management',
  //     subPermissionsToCheck: []
  //   })
  // }

  // useEffect(() => {
  //   console.log('isUserHasPermissionNavigation: ', isUserHasPermissionNavigation)
  // }, [isUserHasPermissionNavigation])
  /** Temp code: End */

  return (
    <>
      <MenuItem href={`/${locale}/${userPanel}`} icon={<i className='tabler-layout-dashboard' />}>
        {dictionary['navigation'].dashboard}
      </MenuItem>
      <MenuItem
        href={`/${locale}/${userPanel}/user-management`}
        icon={<i className='tabler-user' />}
        activeUrl={`/${locale}/${userPanel}/user-management`}
        exactMatch={false}
        className={isUserHasPermissionNavigation?.user_management ? '' : 'hidden'}
      >
        {dictionary['navigation'].user_management}
      </MenuItem>
      <MenuItem
        href={`/${locale}/${userPanel}/vendor-management`}
        icon={<i className='tabler-user' />}
        activeUrl={`/${locale}/${userPanel}/vendor-management`}
        exactMatch={false}
      >
        {dictionary['navigation'].vendor_management}
      </MenuItem>
      <MenuItem
        href={disputeResolutionPath}
        icon={<i className='tabler-info-circle' />}
        activeUrl={disputeResolutionPath}
        exactMatch={false}
      >
        {dictionary['navigation'].dispute_resolution}
      </MenuItem>
      <MenuItem
        href={`/${locale}/${userPanel}/order-management`}
        icon={<i className='tabler-user' />}
        className={isUserHasPermissionNavigation?.order_management ? '' : 'hidden'}
      >
        {dictionary['navigation'].order_management}
      </MenuItem>
    </>
  )
}

export default VerticalMenuAdmin
