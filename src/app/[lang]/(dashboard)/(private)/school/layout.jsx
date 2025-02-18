// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Lib Imports
import { authOptions } from '@/libs/auth'

// HOC Imports
import RoleAuthGuard from '@/hocs/RoleAuthGuard'

// Server Action Imports
import { getPathnameWithoutPanel } from '@/app/server/actions'

// Util Imports
import { USER_PANELS } from '@/utils/constants'
import ClientRedirect from '@/components/nourishubs/ClientRedirect'
import SocketHandler from '@/socket/SocketHandler'
import GlobalReviewDialog from '@/views/dashboard/school/order-management/order-delivery-approval/GlobalReviewDialog'
// import GlobalReviewDialog from '@/views/dashboard/school/feedback/GlobalReviewDialog'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  return (
    <RoleAuthGuard locale={params.lang} allowedUserRoles={['school_role']}>
      <GlobalReviewDialog />
      <SocketHandler />
      {children}
      {/* <CheckUserProfileStatus locale={params.lang}>{children}</CheckUserProfileStatus> */}
    </RoleAuthGuard>
  )
}

export async function CheckUserProfileStatus({ children, locale }) {
  // console.log('----------> School Panel: Layout: CheckUserProfileStatus: here: ', new Date()?.toISOString())

  const session = await getServerSession(authOptions)
  const pathnameWithoutPanel = await getPathnameWithoutPanel()

  const allowedRoutesForInvalidProfile = [
    // '/',
    '/profile'
  ]

  const redirectUrl = `/${locale}/${USER_PANELS?.school}/profile`

  let isValidRoute = true

  // console.log('----------> session?.user?.verificationStatus: ', session?.user?.verificationStatus)

  if (
    session &&
    session?.user?.verificationStatus !== 'approved' &&
    !allowedRoutesForInvalidProfile?.includes(pathnameWithoutPanel)
  ) {
    isValidRoute = false
    // redirect(redirectUrl)
  }

  return <>{isValidRoute ? children : <ClientRedirect redirectPath={redirectUrl} />}</>
  // return <>{children}</>
}

export default Layout
