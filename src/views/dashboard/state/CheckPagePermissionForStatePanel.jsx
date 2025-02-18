'use client'

// React Imports
import { useEffect } from 'react'

// Next Imports
import { useParams, usePathname, useRouter } from 'next/navigation'

// Third-party Imports
import { useSelector } from 'react-redux'

// Redux Imports
import { profileState } from '@/redux-store/slices/profile'

// Server Action Imports
import { getPathnameWithoutPanel } from '@/app/server/actions'

// Util Imports
import { getMatchingPatternPermissions, isUserHasPermissions } from '@/utils/globalFunctions'
import { statePanelUrlPermissions } from '@/utils/url-permissions/statePanelUrlPermissions'
import { USER_PANELS } from '@/utils/constants'

/**
 * Page
 */
const CheckPagePermissionForStatePanel = ({ children }) => {
  // Hooks
  const router = useRouter()
  const pathName = usePathname()
  const { lang: locale } = useParams()
  const { user = null } = useSelector(profileState)

  const checkPagePermissions = async () => {
    const pathnameWithoutPanel = await getPathnameWithoutPanel()
    let currentPageUrlPermissions = statePanelUrlPermissions?.[pathnameWithoutPanel] || null

    if (!currentPageUrlPermissions) {
      currentPageUrlPermissions = getMatchingPatternPermissions(pathnameWithoutPanel, statePanelUrlPermissions)
    }

    const isUserHasPermissionForPage = isUserHasPermissions({
      permissions: user?.permissions,
      permissionsToCheck: currentPageUrlPermissions
    })

    if (!isUserHasPermissionForPage) {
      router?.push(`/${locale}/${USER_PANELS?.state}`)
    }
  }

  useEffect(() => {
    checkPagePermissions()
  }, [pathName])

  return <>{children}</>
}

export default CheckPagePermissionForStatePanel
