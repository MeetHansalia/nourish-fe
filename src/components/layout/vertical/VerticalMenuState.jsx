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
const VerticalMenuSuperAdmin = ({ dictionary, userRole, userPanel }) => {
  // Hooks
  const params = useParams()
  const { user = null } = useSelector(profileState)

  // Vars
  const { lang: locale } = params

  /**
   * Permission: Start
   */
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
      }),
      foodchart_management: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'foodchart_management',
        subPermissionsToCheck: ['create_foodchart', 'approve_foodchart', 'get_foodchart_requests']
      }),
      dispute_management: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'dispute_management',
        subPermissionsToCheck: [
          'get_dispute_list',
          'dispute_create',
          'dispute_response',
          'dispute_authority_response',
          'dispute_response_list',
          'get_dispute_details',
          'mark_issue_as_resolved'
        ]
      })
    }),
    [user?.permissions]
  )
  /** Permission: End */

  const disputeResolutionPath = `/${locale}/${userPanel}/dispute-management`

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
        icon={<i className='tabler-device-desktop-analytics' />}
        className={isUserHasPermissionNavigation?.order_management ? '' : 'hidden'}
      >
        {dictionary['navigation'].order_management}
      </MenuItem>
      <MenuItem
        href={`/${locale}/${userPanel}/document-verify`}
        icon={<i className='tabler-clipboard-text' />}
        activeUrl={`/${locale}/${userPanel}/document-verify`}
        exactMatch={false}
      >
        {dictionary['navigation'].document_approval}
      </MenuItem>
      <MenuItem
        href={disputeResolutionPath}
        icon={<i className='tabler-info-circle' />}
        activeUrl={disputeResolutionPath}
        exactMatch={false}
        className={isUserHasPermissionNavigation?.dispute_management ? '' : 'hidden'}
      >
        {dictionary['navigation'].dispute_resolution}
      </MenuItem>
      <MenuItem
        href={`/${locale}/${userPanel}/school-vendor-associates`}
        icon={<i className='tabler-arrows-join-2' />}
        activeUrl={`/${locale}/${userPanel}/school-vendor-associates`}
        exactMatch={false}
      >
        {dictionary['navigation'].school_vendor_associates}
      </MenuItem>
      {/* <MenuItem
        href={`/${locale}/${userPanel}/manage-vendor-request`}
        icon={<i className='tabler-user-cog' />}
        activeUrl={`/${locale}/${userPanel}/manage-vendor-request`}
        exactMatch={false}
      >
        {dictionary['navigation'].manage_Vendors_Requests}
      </MenuItem> */}
      <MenuItem
        href={`/${locale}/${userPanel}/foodchart-creation-approval`}
        icon={<i className='tabler-tools-kitchen-3' />}
        activeUrl={`/${locale}/${userPanel}/foodchart-creation-approval`}
        exactMatch={false}
        className={isUserHasPermissionNavigation?.foodchart_management ? '' : 'hidden'}
      >
        {dictionary['navigation'].foodchart_creation_approval}
      </MenuItem>
      <MenuItem href={`/${locale}/${userPanel}/order-reviews`} icon={<i className='tabler-star' />}>
        {dictionary['navigation'].review}
      </MenuItem>
      <MenuItem
        href={`/${locale}/${userPanel}/menu-nutrition-manage`}
        icon={<i className='tabler-salad' />}
        activeUrl={`/${locale}/${userPanel}/menu-nutrition-manage`}
        exactMatch={false}
      >
        {dictionary['navigation'].menu_nutrition_manage}
      </MenuItem>
    </>
  )
}

export default VerticalMenuSuperAdmin
