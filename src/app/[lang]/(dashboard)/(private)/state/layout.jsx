// HOC Imports
import { Toaster } from 'react-hot-toast'

import RoleAuthGuard from '@/hocs/RoleAuthGuard'
import SocketHandler from '@/socket/SocketHandler'
import CheckPagePermissionForStatePanel from '@/views/dashboard/state/CheckPagePermissionForStatePanel'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  return (
    <RoleAuthGuard locale={params.lang} allowedUserRoles={['state_executive_role']}>
      <Toaster position='top-right' />

      <SocketHandler />
      {/* {children} */}
      <CheckPagePermissionForStatePanel>{children}</CheckPagePermissionForStatePanel>
    </RoleAuthGuard>
  )
}

export default Layout
