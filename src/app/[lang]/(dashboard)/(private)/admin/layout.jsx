// Server Action Imports
// import { getPathnameWithoutPanel } from '@/app/server/actions'

// HOC Imports
import RoleAuthGuard from '@/hocs/RoleAuthGuard'
import SocketHandler from '@/socket/SocketHandler'
import CheckPagePermissionForAdminPanel from '@/views/dashboard/admin/CheckPagePermissionForAdminPanel'

// Util Imports
// import { fetchUserPermissions, isUserHasPermissions } from '@/utils/globalFunctions'
// import { adminPanelUrlPermissions } from '@/utils/url-permissions/adminPanelUrlPermissions'

// Component Imports
// import NotAuthorized from '@/views/dashboard/common/NotAuthorized'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  // Vars
  // const userPermissions = await fetchUserPermissions()
  // const pathnameWithoutPanel = await getPathnameWithoutPanel()
  // const currentPageUrlPermissions = adminPanelUrlPermissions?.[pathnameWithoutPanel] || null

  // const isUserHasPermissionForPage = isUserHasPermissions({
  //   permissions: userPermissions,
  //   permissionsToCheck: currentPageUrlPermissions
  // })

  // console.log('------------------------------------> isUserHasPermissionForPage: ', isUserHasPermissionForPage)

  return (
    <RoleAuthGuard locale={params.lang} allowedUserRoles={['admin_role']}>
      <SocketHandler />

      {/* {children} */}
      {/* {isUserHasPermissionForPage ? children : <NotAuthorized />} */}
      <CheckPagePermissionForAdminPanel>{children}</CheckPagePermissionForAdminPanel>
    </RoleAuthGuard>
  )
}

export default Layout
