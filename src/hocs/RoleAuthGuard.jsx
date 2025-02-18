// Third-party Imports
import { getServerSession } from 'next-auth'

// Lib Imports
import { authOptions } from '@/libs/auth'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'

export default async function RoleAuthGuard({ children, locale, allowedUserRoles = [] }) {
  const session = await getServerSession(authOptions)

  const userRole = session?.user?.role || ''
  const isValidUser = session && userRole && allowedUserRoles?.includes(userRole)

  return <>{isValidUser ? children : <AuthRedirect lang={locale} />}</>
}
