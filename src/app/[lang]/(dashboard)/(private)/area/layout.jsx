// HOC Imports
import RoleAuthGuard from '@/hocs/RoleAuthGuard'
import SocketHandler from '@/socket/SocketHandler'
import CheckPagePermissionForAreaPanel from '@/views/dashboard/area/CheckPagePermissionForAreaPanel'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  return (
    <RoleAuthGuard locale={params.lang} allowedUserRoles={['area_executive_role']}>
      <SocketHandler />

      {/* {children} */}
      <CheckPagePermissionForAreaPanel>{children}</CheckPagePermissionForAreaPanel>
    </RoleAuthGuard>
  )
}

export default Layout
