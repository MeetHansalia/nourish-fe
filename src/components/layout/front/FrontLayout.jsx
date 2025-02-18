'use client'

// React Imports
import { useEffect } from 'react'

// Next Imports
import { usePathname } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'
import AOS from 'aos'
import 'aos/dist/aos.css'

// MUI Imports
import useScrollTrigger from '@mui/material/useScrollTrigger'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import useLayoutInit from '@core/hooks/useLayoutInit'

// Util Imports
import { blankLayoutClasses } from '@layouts/utils/layoutClasses'
import { AOS_INIT_CONFIG_OPTIONS } from '@/utils/constants'

// Component Imports
import FrontLayoutHeader from '@components/layout/front/FrontLayoutHeader'
import FrontLayoutFooter from '@components/layout/front/FrontLayoutFooter'

/**
 * Page
 */
const FrontLayout = props => {
  // Props
  const { children, systemMode } = props
  const { dictionary } = props
  const { session } = props

  // Hooks
  const { settings } = useSettings()

  useLayoutInit(systemMode)

  const pathname = usePathname()
  const updatedPathname = pathname.replace(/^\/[^/]+/, '') // Removes the first segment

  const isNeedToShowFooter = [
    '',
    '/signup',
    '/about-us'
    // '/demo-pages-ref/check-cookies'
  ].includes(updatedPathname)

  const isSignUpPages = ['/signup/school', '/signup/parent', '/signup/vendor', '/contact-us'].includes(updatedPathname)

  // Detect window scroll
  const trigger = useScrollTrigger({
    threshold: 170,
    disableHysteresis: true
  })

  /**
   * Page Life Cycle: Start
   */
  useEffect(() => {
    AOS?.init(AOS_INIT_CONFIG_OPTIONS)
  }, [])
  /** Page Life Cycle: End */

  return (
    <div className={classnames(blankLayoutClasses.root, 'is-full bs-full nh-front-layout')} data-skin={settings.skin}>
      <FrontLayoutHeader
        className={`${isSignUpPages ? 'nh-sign-up-page' : ''} ${trigger ? 'nh-header-scrolled' : ''}`}
        dictionary={dictionary}
        session={session}
      />
      <div className={`common-page ${isSignUpPages ? 'nh-sign-up-page' : ''}`}>{children}</div>
      {isNeedToShowFooter && <FrontLayoutFooter dictionary={dictionary} />}
    </div>
  )
}

export default FrontLayout
