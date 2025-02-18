// HOC Imports
import RoleAuthGuard from '@/hocs/RoleAuthGuard'
import SocketHandler from '@/socket/SocketHandler'
import CheckPagePermissionForDistrictPanel from '@/views/dashboard/district/CheckPagePermissionForDistrictPanel'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  return (
    <RoleAuthGuard locale={params.lang} allowedUserRoles={['district_executive_role']}>
      <SocketHandler />
      {/* {children} */}
      <CheckPagePermissionForDistrictPanel>{children}</CheckPagePermissionForDistrictPanel>
    </RoleAuthGuard>
  )
}

export default Layout
