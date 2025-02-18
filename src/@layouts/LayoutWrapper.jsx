'use client'

// React Imports
import { useEffect, useRef } from 'react'

// Third-party Imports
import { getSession, useSession } from 'next-auth/react'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import useLayoutInit from '@core/hooks/useLayoutInit'

// Util Imports
import {
  fetchLoggedInUserProfile,
  fetchUserProfileAndUpdateStoreValue,
  updateUserProfileStoreValue
} from '@utils/globalFunctions'

const LayoutWrapper = props => {
  // Props
  const { systemMode, verticalLayout, horizontalLayout } = props

  // Hooks
  const { settings } = useSettings()
  const { data: session, status, update } = useSession()

  // Refs
  const isNextAuthLatestDataSet = useRef(false)

  useLayoutInit(systemMode)

  // useEffect(() => {
  //   fetchUserProfileAndUpdateStoreValue()
  // }, [])

  const updateUserProfileStoreAndSession = async () => {
    const profileData = await fetchLoggedInUserProfile()
    const user = profileData?.user || null

    updateUserProfileStoreValue(user)

    try {
      await update({ user: user }) // Update session data
      const updatedSession = await getSession() // Refresh session cache
    } catch (error) {
      console.error('Failed to update session:', error)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session && !isNextAuthLatestDataSet.current) {
      isNextAuthLatestDataSet.current = true
      updateUserProfileStoreAndSession()
    }
  }, [status])

  // Return the layout based on the layout context
  return (
    <div className='flex flex-col flex-auto nh-dashboard-layout' data-skin={settings.skin}>
      {settings.layout === 'horizontal' ? horizontalLayout : verticalLayout}
    </div>
  )
}

export default LayoutWrapper
