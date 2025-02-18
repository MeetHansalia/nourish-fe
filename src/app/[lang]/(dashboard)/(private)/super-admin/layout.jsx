// HOC Imports
import RoleAuthGuard from '@/hocs/RoleAuthGuard'
import SocketHandler from '@/socket/SocketHandler'

// Util Imports
// import { fetchUserPermissions } from '@/utils/globalFunctions'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  // const userPermissions = await fetchUserPermissions()

  // console.log('userPermissions: ', userPermissions)

  return (
    <RoleAuthGuard locale={params.lang} allowedUserRoles={['super_admin_role']}>
      <SocketHandler />
      {children}
    </RoleAuthGuard>
  )
}

export default Layout
