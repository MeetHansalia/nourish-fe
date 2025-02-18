// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Lib Imports
import { authOptions } from '@/libs/auth'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { USER_ROLE_TO_PANEL_MAPPING } from '@/utils/constants'

const GuestOnlyRoute = async ({ children, lang }) => {
  const session = await getServerSession(authOptions)
  const userRole = session?.user?.role || ''
  const userPanel = USER_ROLE_TO_PANEL_MAPPING[userRole] || ''

  if (session) {
    // redirect(getLocalizedUrl(themeConfig.homePageUrl, lang))
    redirect(getLocalizedUrl(`/${userPanel}`, lang))
  }

  return <>{children}</>
}

export default GuestOnlyRoute
