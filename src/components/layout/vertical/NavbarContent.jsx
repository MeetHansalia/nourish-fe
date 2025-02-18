'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'
import { isCancel } from 'axios'
import { getSession, useSession } from 'next-auth/react'

// MUI Imports
import { Button } from '@mui/material'

// Component Imports
import NavToggle from './NavToggle'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import { apiResponseErrorHandling, fetchUserProfileAndUpdateStoreValue, toastError } from '@/utils/globalFunctions'
import { USER_ROLE_TO_PANEL_MAPPING } from '@/utils/constants'
import { API_ROUTER } from '@/utils/apiRoutes'
import axiosApiCall from '@/utils/axiosApiCall'
import { useTranslation } from '@/utils/getDictionaryClient'

// Server Action Imports
import { navigate } from '@/app/server/actions'

/**
 * Page
 */
const NavbarContent = () => {
  // Hooks
  const { lang: locale } = useParams()
  const { data: session, update } = useSession()
  const { t } = useTranslation(locale)

  // Vars
  const isUserAccessMode = session?.originalAuth?.access_token ? true : false

  /**
   * User access: Start
   */
  const [isExitUserAccessLoading, setIsExitUserAccessLoading] = useState(false)
  const isExitUserAccessLoadingRef = useRef(false)
  const exitUserAccessController = useRef()

  const exitUserAccessHandler = async () => {
    if (isExitUserAccessLoadingRef?.current) {
      return
    }

    const sessionData = await getSession()

    if (!sessionData?.originalAuth?.access_token) {
      return
    }

    isExitUserAccessLoadingRef.current = true
    setIsExitUserAccessLoading(true)

    if (exitUserAccessController.current) {
      exitUserAccessController.current?.abort()
    }

    exitUserAccessController.current = new AbortController()

    axiosApiCall
      .get(API_ROUTER.GET_PROFILE, {
        headers: {
          Authorization: `Bearer ${sessionData?.originalAuth?.access_token}`
        },
        signal: exitUserAccessController?.current?.signal
      })
      .then(async response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        const userAccess = {
          user: responseBodyData?.user,
          access_token: sessionData?.originalAuth?.access_token,
          originalAuth: null
        }

        try {
          await update({ userAccess: userAccess }) // Update session data
          const updatedSession = await getSession() // Refresh session cache

          // console.log('updatedSession: ', updatedSession)

          await fetchUserProfileAndUpdateStoreValue()

          const userRole = updatedSession?.user?.role || ''
          const userPanel = USER_ROLE_TO_PANEL_MAPPING[userRole] || ''
          const redirectURL = `/${locale}/${userPanel}`

          navigate({ url: redirectURL })
        } catch (error) {
          console.error('Failed to update session:', error)
        }

        setIsExitUserAccessLoading(false)
        isExitUserAccessLoadingRef.current = false
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsExitUserAccessLoading(false)
          isExitUserAccessLoadingRef.current = false

          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }
  /** User access: End */

  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-4'>
        <NavToggle />
        {/* <ModeDropdown /> */}
      </div>
      <div className='flex items-center'>
        {isUserAccessMode && (
          <Button
            variant='contained'
            size='small'
            color='error'
            startIcon={<i className='tabler-logout-2' />}
            disabled={isExitUserAccessLoading}
            onClick={exitUserAccessHandler}
          >
            {t('common.exit_access')}
          </Button>
        )}
        <LanguageDropdown />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
