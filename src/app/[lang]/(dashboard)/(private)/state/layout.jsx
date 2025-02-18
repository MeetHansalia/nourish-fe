// HOC Imports
import RoleAuthGuard from '@/hocs/RoleAuthGuard'
import SocketHandler from '@/socket/SocketHandler'
import CheckPagePermissionForStatePanel from '@/views/dashboard/state/CheckPagePermissionForStatePanel'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  return (
    <RoleAuthGuard locale={params.lang} allowedUserRoles={['state_executive_role']}>
      <SocketHandler />
      {/* {children} */}
      <CheckPagePermissionForStatePanel>{children}</CheckPagePermissionForStatePanel>
    </RoleAuthGuard>
  )
}

export default Layout
