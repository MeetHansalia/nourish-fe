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
  return <TeacherRoleAuthGuard locale={params.lang}>{children}</TeacherRoleAuthGuard>
}

// HOC Component
export async function TeacherRoleAuthGuard({ children, locale }) {
  const session = await getServerSession(authOptions)
  const redirectUrl = `/${locale}/${USER_PANELS?.staff}`

  if (session && session?.user?.role !== 'teacher_role') {
    redirect(redirectUrl)
  }

  return <>{children}</>
}

export default Layout
