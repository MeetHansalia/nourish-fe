// HOC Imports
import { Toaster } from 'react-hot-toast'

import RoleAuthGuard from '@/hocs/RoleAuthGuard'
import SocketHandler from '@/socket/SocketHandler'
import CheckPagePermissionForAreaPanel from '@/views/dashboard/area/CheckPagePermissionForAreaPanel'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  return (
    <RoleAuthGuard locale={params.lang} allowedUserRoles={['area_executive_role']}>
      <Toaster position='top-right' />

      <SocketHandler />

      {/* {children} */}
      <CheckPagePermissionForAreaPanel>{children}</CheckPagePermissionForAreaPanel>
    </RoleAuthGuard>
  )
}

export default Layout
