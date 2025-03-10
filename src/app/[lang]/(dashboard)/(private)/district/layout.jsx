// HOC Imports
import { Toaster } from 'react-hot-toast'

import RoleAuthGuard from '@/hocs/RoleAuthGuard'
import SocketHandler from '@/socket/SocketHandler'
import CheckPagePermissionForDistrictPanel from '@/views/dashboard/district/CheckPagePermissionForDistrictPanel'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  return (
    <RoleAuthGuard locale={params.lang} allowedUserRoles={['district_executive_role']}>
      <Toaster position='top-right' />

      <SocketHandler />
      {/* {children} */}
      <CheckPagePermissionForDistrictPanel>{children}</CheckPagePermissionForDistrictPanel>
    </RoleAuthGuard>
  )
}

export default Layout
