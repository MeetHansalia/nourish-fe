// React Imports
import { useEffect, useMemo } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// Third-party Imports
import { useSelector } from 'react-redux'

// Component Imports
import { MenuItem } from '@menu/vertical-menu'

// Util Imports
import { isUserHasPermission } from '@/utils/globalFunctions'

// Redux Imports
import { profileState } from '@/redux-store/slices/profile'

/**
 * Page
 */
const VerticalMenuDistrict = ({ dictionary, userRole, userPanel }) => {
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
        href={`/${locale}/${userPanel}/order-management`}
        icon={<i className='tabler-user' />}
        className={isUserHasPermissionNavigation?.order_management ? '' : 'hidden'}
      >
        {dictionary['navigation'].order_management}
      </MenuItem>
      <MenuItem
        href={`/${locale}/${userPanel}/schools-vendors-verify`}
        icon={<i className='tabler-user' />}
        // className={isUserHasPermissionNavigation?.schools_and_vendors_verify ? '' : 'hidden'}
        activeUrl={`/${locale}/${userPanel}/schools-vendors-verify`}
        exactMatch={false}
      >
        {dictionary['navigation'].schools_and_vendors_verify}
      </MenuItem>

      <MenuItem
        href={`/${locale}/${userPanel}/school-vendor-associates`}
        icon={<i className='tabler-user' />}
        activeUrl={`/${locale}/${userPanel}/school-vendor-associates`}
        exactMatch={false}
      >
        {dictionary['navigation'].school_vendor_associates}
      </MenuItem>
      <MenuItem
        href={`/${locale}/${userPanel}/vendor-selection-chart`}
        icon={<i className='tabler-user' />}
        activeUrl={`/${locale}/${userPanel}/vendor-selection-chart`}
        exactMatch={false}
      >
        {dictionary['navigation'].vendor_selection_chart}
      </MenuItem>
      <MenuItem
        href={`/${locale}/${userPanel}/menu-nutrition-manage`}
        icon={<i className='tabler-user' />}
        activeUrl={`/${locale}/${userPanel}/menu-nutrition-manage`}
        exactMatch={false}
      >
        {dictionary['navigation'].menu_nutrition_manage}
      </MenuItem>
    </>
  )
}

export default VerticalMenuDistrict
