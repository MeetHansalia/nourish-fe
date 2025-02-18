import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'

// HOC Imports
import RoleAuthGuard from '@/hocs/RoleAuthGuard'
import GetCommonData from './GetCommonData'

import { getPathnameWithoutPanel } from '@/app/server/actions'

import { USER_PANELS } from '@/utils/constants'

import ClientRedirect from '@/components/nourishubs/ClientRedirect'
import SocketHandler from '@/socket/SocketHandler'
import GlobalReviewDialog from '@/views/dashboard/parent/reviews-for-meals/GlobalReviewDialog'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  return (
    <RoleAuthGuard locale={params.lang} allowedUserRoles={['parent_role']}>
      <SocketHandler />
      <GlobalReviewDialog />

      {children}
      {/* <CheckParentProfileStatus locale={params.lang}>
        <GetCommonData>{children}</GetCommonData>
      </CheckParentProfileStatus> */}
    </RoleAuthGuard>
  )
}

export async function CheckParentProfileStatus({ children, locale }) {
  const session = await getServerSession(authOptions)
  const pathnameWithoutPanel = await getPathnameWithoutPanel()

  const allowedRoutesForInvalidProfile = ['/parent-profile', '/kid-profile-management'] //TODO: Remove "/reviews-for-meals" route from here

  const redirectUrl = `/${locale}/${USER_PANELS?.parent}/kid-profile-management`

  let isValidRoute = true

  if (
    session &&
    session?.user?.approvedKids?.length === 0 &&
    !allowedRoutesForInvalidProfile?.includes(pathnameWithoutPanel)
  ) {
    isValidRoute = false
  }

  return <>{isValidRoute ? children : <ClientRedirect redirectPath={redirectUrl} />}</>
}

export default Layout
