/**
 * ! The server actions below are used to fetch the static data from the fake-db. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can swap the code below with your own database queries.
 */
'use server'

// Next Imports
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

// Third-party Imports
import { pathname as nextExtraPathname } from 'next-extra/pathname'

// Util Imports
import { USER_PANELS } from '@/utils/constants'

/**
 * Page
 */
export const getLangFromUrl = async () => {
  // const referer = headers()?.get('referer') // Get the referer header
  // const pathname = new URL(referer)?.pathname // Extract pathname

  const pathname = await nextExtraPathname()
  const segments = pathname?.split('/')?.filter(Boolean) // Split and remove empty segments

  return segments?.[0] || 'en'
}

export async function navigate(fnInput = {}) {
  redirect(fnInput?.url)
}

export const getPanelFromUrl = async () => {
  // const referer = headers()?.get('referer') || '' // Get the referer header
  // const pathname = new URL(referer)?.pathname // Extract pathname

  const pathname = await nextExtraPathname()
  const segments = pathname?.split('/')?.filter(Boolean) // Split and remove empty segments
  const panelName = segments?.[1] || ''
  const isValidPanel = Object.values(USER_PANELS)?.some(value => value === panelName)

  return isValidPanel ? panelName : ''
}

export const getPathname = async () => {
  const pathname = await nextExtraPathname()

  return pathname
}

export const getPathnameWithoutPanel = async () => {
  const pathname = await nextExtraPathname()
  const pathnameWithoutPanel = '/' + pathname?.split('/')?.slice(3)?.join('/')

  return pathnameWithoutPanel
}

export const getPathnameWithoutLang = async () => {
  const pathname = await nextExtraPathname()
  const pathnameWithoutLang = '/' + pathname?.split('/')?.filter(Boolean)?.slice(1)?.join('/')

  return pathnameWithoutLang
}
