// Third-party Imports
import { getServerSession } from 'next-auth'

// Lib Imports
import { Toaster } from 'react-hot-toast'

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
      <Toaster position='top-right' />
      <SocketHandler />
      {children}
      {/* <CheckUserProfileStatus locale={params.lang}>{children}</CheckUserProfileStatus> */}
    </RoleAuthGuard>
  )
}

export async function CheckUserProfileStatus({ children, locale }) {
  const session = await getServerSession(authOptions)
  const pathnameWithoutPanel = await getPathnameWithoutPanel()

  const allowedRoutesForInvalidProfile = ['/profile']

  const redirectUrl = `/${locale}/${USER_PANELS?.vendor}/profile`

  let isValidRoute = true

  // console.log('session?.user?.thresHoldApprove', session?.user?.thresHoldApprove)

  if (
    session &&
    (session?.user?.verificationStatus !== 'approved' ||
      session?.user?.thresHoldApprove !== 'approved' ||
      session?.user?.status === 'suspended') &&
    !allowedRoutesForInvalidProfile?.includes(pathnameWithoutPanel)
  ) {
    isValidRoute = false
    // redirect(redirectUrl)
  }

  return <>{isValidRoute ? children : <ClientRedirect redirectPath={redirectUrl} />}</>
  // return <>{children}</>
}

export default Layout
