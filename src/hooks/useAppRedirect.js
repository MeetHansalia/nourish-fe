'use client'

import { usePathname, useRouter } from 'next/navigation'

import { getPanelName } from '@/utils/globalFunctions'
import { getLocalizedUrl } from '@/utils/i18n'

export const useRedirect = () => {
  const router = useRouter()
  const pathname = usePathname()

  const locale = pathname.split('/')[1]

  const panelName = getPanelName(pathname)

  const redirectTo = path => {
    if (!path) return `/${locale}/${panelName}`

    const redirectUrl = getLocalizedUrl(`/${panelName}/${path}`, locale)

    return router.push(redirectUrl)
  }

  return { locale, router, pathname, redirectTo }
}
