// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Lib Imports
import { authOptions } from '@/libs/auth'

// Util Imports
import { USER_PANELS } from '@/utils/constants'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  return <CheckUserProfileStatus locale={params.lang}>{children}</CheckUserProfileStatus>
}

// HOC Component
export async function CheckUserProfileStatus({ children, locale }) {
  // console.log('----------> School Panel: Layout: CheckUserProfileStatus: here: ', new Date()?.toISOString())

  const session = await getServerSession(authOptions)
  const redirectUrl = `/${locale}/${USER_PANELS?.school}/profile`

  if (session && session?.user?.verificationStatus !== 'approved') {
    redirect(redirectUrl)
  }

  return <>{children}</>
}

export default Layout
