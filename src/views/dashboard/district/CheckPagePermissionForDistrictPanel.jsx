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
import { districtPanelUrlPermissions } from '@/utils/url-permissions/districtPanelUrlPermissions'
import { USER_PANELS } from '@/utils/constants'

/**
 * Page
 */
const CheckPagePermissionForDistrictPanel = ({ children }) => {
  // Hooks
  const router = useRouter()
  const pathName = usePathname()
  const { lang: locale } = useParams()
  const { user = null } = useSelector(profileState)

  const checkPagePermissions = async () => {
    const pathnameWithoutPanel = await getPathnameWithoutPanel()
    let currentPageUrlPermissions = districtPanelUrlPermissions?.[pathnameWithoutPanel] || null

    if (!currentPageUrlPermissions) {
      currentPageUrlPermissions = getMatchingPatternPermissions(pathnameWithoutPanel, districtPanelUrlPermissions)
    }

    const isUserHasPermissionForPage = isUserHasPermissions({
      permissions: user?.permissions,
      permissionsToCheck: currentPageUrlPermissions
    })

    if (!isUserHasPermissionForPage) {
      router?.push(`/${locale}/${USER_PANELS?.district}`)
    }
  }

  useEffect(() => {
    checkPagePermissions()
  }, [pathName])

  return <>{children}</>
}

export default CheckPagePermissionForDistrictPanel
