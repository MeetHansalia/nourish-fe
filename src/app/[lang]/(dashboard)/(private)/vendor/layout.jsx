// Third-party Imports
import { getServerSession } from 'next-auth'

// Lib Imports
import { authOptions } from '@/libs/auth'

// HOC Imports
import RoleAuthGuard from '@/hocs/RoleAuthGuard'

// HOC Imports
import { getPathnameWithoutPanel } from '@/app/server/actions'
import ClientRedirect from '@/components/nourishubs/ClientRedirect'

// Utils Imports
import { USER_PANELS } from '@/utils/constants'
import SocketHandler from '@/socket/SocketHandler'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  return (
    <RoleAuthGuard locale={params.lang} allowedUserRoles={['vendor_role']}>
      <SocketHandler />
      {children}
      {/* <CheckUserProfileStatus locale={params.lang}>{children}</CheckUserProfileStatus> */}
    </RoleAuthGuard>
  )
}

export async function CheckUserProfileStatus({ children, locale }) {
  const session = await getServerSession(authOptions)
  const pathnameWithoutPanel = await getPathnameWithoutPanel()

  const allowedRoutesForInvalidProfile = [
    '/profile-management'
    // '/profile'
  ]

  const redirectUrl = `/${locale}/${USER_PANELS?.vendor}/profile-management`

  let isValidRoute = true

  // console.log('session?.user?.thresHoldApprove', session?.user?.thresHoldApprove)

  if (
    session &&
    (session?.user?.verificationStatus !== 'approved' || session?.user?.thresHoldApprove !== 'approved') &&
    !allowedRoutesForInvalidProfile?.includes(pathnameWithoutPanel)
  ) {
    isValidRoute = false
    // redirect(redirectUrl)
  }

  return <>{isValidRoute ? children : <ClientRedirect redirectPath={redirectUrl} />}</>
  // return <>{children}</>
}

export default Layout
