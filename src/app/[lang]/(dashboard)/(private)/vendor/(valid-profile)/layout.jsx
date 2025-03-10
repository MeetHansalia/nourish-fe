// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Lib Imports
import { authOptions } from '@/libs/auth'

// Utils Imports
import { USER_PANELS } from '@/utils/constants'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  return <CheckUserProfileStatus locale={params.lang}>{children}</CheckUserProfileStatus>
}

// HOC Component
export async function CheckUserProfileStatus({ children, locale }) {
  const session = await getServerSession(authOptions)

  const redirectUrl = `/${locale}/${USER_PANELS?.vendor}/profile`

  if (
    session &&
    (session?.user?.verificationStatus !== 'approved' ||
      session?.user?.thresHoldApprove !== 'approved' ||
      session?.user?.status === 'suspended')
  ) {
    redirect(redirectUrl)
  }

  return <>{children}</>
}

export default Layout
