// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Lib Imports
import { authOptions } from '@/libs/auth'

// HOC Imports
import GetCommonData from './../GetCommonData'

// Util Imports
import { USER_PANELS } from '@/utils/constants'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  return (
    <CheckParentProfileStatus locale={params.lang}>
      <GetCommonData>{children}</GetCommonData>
    </CheckParentProfileStatus>
  )
}

export async function CheckParentProfileStatus({ children, locale }) {
  const session = await getServerSession(authOptions)
  const redirectUrl = `/${locale}/${USER_PANELS?.parent}/kid-profile-management`

  if (session && session?.user?.approvedKids?.length === 0) {
    redirect(redirectUrl)
  }

  return <>{children}</>
}

export default Layout
