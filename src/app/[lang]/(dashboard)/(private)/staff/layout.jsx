// Third-party Imports
import { getServerSession } from 'next-auth'

// Lib Imports
import { authOptions } from '@/libs/auth'

// Component Imports
import ClientRedirect from '@/components/nourishubs/ClientRedirect'

// HOC Imports
import RoleAuthGuard from '@/hocs/RoleAuthGuard'

// Server Action Imports
import { getPathnameWithoutPanel } from '@/app/server/actions'

// Util Imports
import { USER_PANELS } from '@/utils/constants'
import SocketHandler from '@/socket/SocketHandler'
import GlobalReviewDialog from '@/views/dashboard/staff/feedback/GlobalReviewDialog'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  return (
    <RoleAuthGuard locale={params.lang} allowedUserRoles={['teacher_role', 'school_otherers_role']}>
      <GlobalReviewDialog />

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
    // '/',
    '/',
    '/meal-selection',
    '/issue-reporting',
    '/feedback'
  ]

  const redirectUrl = `/${locale}/${USER_PANELS?.staff}`

  let isValidRoute = true

  if (
    session &&
    session?.user?.role !== 'teacher_role' &&
    !allowedRoutesForInvalidProfile?.includes(pathnameWithoutPanel)
  ) {
    isValidRoute = false
    // redirect(redirectUrl)
  }

  return <>{isValidRoute ? children : <ClientRedirect redirectPath={redirectUrl} />}</>
  // return <>{children}</>
}

export default Layout
