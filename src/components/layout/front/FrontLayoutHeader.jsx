// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'

// Component Imports
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { USER_ROLE_TO_PANEL_MAPPING } from '@/utils/constants'

/**
 * Page
 */
const FrontLayoutHeader = props => {
  // Props
  const { session } = props
  const dictionary = props.dictionary

  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()
  const pathname = usePathname()

  // Vars
  const contactUsUrl = getLocalizedUrl('/contact-us', locale)
  const signUpUrl = getLocalizedUrl('/signup', locale)
  const landingPageUrl = getLocalizedUrl('/', locale)
  const userRole = session?.user?.role || ''
  const userPanel = USER_ROLE_TO_PANEL_MAPPING[userRole] || ''

  /**
   * General function: Start
   */
  const joinOnClick = () => {
    router.push(signUpUrl)
  }

  const loginOnClick = () => {
    router.push(getLocalizedUrl('/login', locale))
  }

  const homeOnClick = () => {
    router.push(getLocalizedUrl('/dashboard', locale))
  }
  /** General function: End */

  /**
   * Sidebar open close handler: Start
   */
  const [isToggleMenuOpen, setIsToggleMenuOpen] = useState(false)
  const sidebarRef = useRef(null)
  const sidebarOpenCloseButtonRef = useRef(null)

  const toggleMenuClickHandler = () => {
    setIsToggleMenuOpen(!isToggleMenuOpen)
  }

  const handleClickOutside = event => {
    if (
      sidebarRef?.current &&
      !sidebarRef?.current?.contains(event?.target) &&
      sidebarOpenCloseButtonRef?.current &&
      !sidebarOpenCloseButtonRef?.current?.contains(event?.target)
    ) {
      setIsToggleMenuOpen(false)
    }
  }

  useEffect(() => {
    setIsToggleMenuOpen(false)
  }, [pathname])
  /** Sidebar open close handler: End */

  /**
   * Page Life Cycle: Start
   */
  useEffect(() => {
    document?.addEventListener('mousedown', handleClickOutside)

    return () => {
      document?.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  /** Page Life Cycle: End */

  return (
    <div className={`header-main ${props?.className || ''}`}>
      <div className='common-container'>
        <div className='header-inner'>
          <div className='header-left'>
            {/* <Link href={landingPageUrl}> */}
            <img src='/images/nourishubs/front/logo.svg' alt='logo'></img>
            {/* </Link> */}
          </div>
          <div className='header-right'>
            <div className='header-right-toggle-menu'>
              <ul>
                <li ref={sidebarOpenCloseButtonRef}>
                  <div
                    className={`toggle-menu-block ${isToggleMenuOpen ? 'nh-menu-open' : ''}`}
                    onClick={toggleMenuClickHandler}
                  >
                    <div className='menu-bar'>
                      <span className='menu-bar-lines'></span>
                      <span className='menu-bar-lines'></span>
                      <span className='menu-bar-lines'></span>
                    </div>
                  </div>
                </li>
                {/* <li className='btn-padding lang-drop-block'>
                  <LanguageDropdown />
                </li> */}
              </ul>
            </div>
            <ul ref={sidebarRef} className={`dektop-view-block ${isToggleMenuOpen ? 'nh-menu-open' : ''}`}>
              <li className='logo-block-toggle'>
                {/* <Link href={landingPageUrl}> */}
                <img src='/images/nourishubs/front/logo.svg' alt='logo'></img>
                {/* </Link> */}
              </li>
              <li>
                <Link
                  href={landingPageUrl}
                  className={pathname === landingPageUrl || pathname + '/' === landingPageUrl ? 'active-menu' : ''}
                >
                  {dictionary?.navigation?.home}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about-us`} className={pathname === `/${locale}/about-us` ? 'active-menu' : ''}>
                  {dictionary?.navigation?.about_us}
                </Link>
              </li>
              <li>
                <Link href={contactUsUrl} className={pathname === contactUsUrl ? 'active-menu' : ''}>
                  {dictionary?.navigation?.contact_us}
                </Link>
              </li>
              {/* <li className='btn-padding lang-drop-block'>
                <LanguageDropdown />
              </li> */}

              {/* <li className='btn-padding'>
                <Button onClick={joinOnClick} className='border-btn-common'>
                  {dictionary?.common?.join}
                </Button>
              </li>
              <li>
                <Button className='fill-btn-common'>{dictionary?.common?.login}</Button>
              </li> */}

              {session ? (
                <li>
                  {/* <Button onClick={homeOnClick} className='fill-btn-common'>
                    {dictionary?.navigation?.dashboard}
                  </Button> */}
                  <Link href={`/${locale}/${userPanel}`} className='fill-btn-common'>
                    {dictionary?.navigation?.dashboard}
                  </Link>
                </li>
              ) : (
                <>
                  <li className='btn-padding'>
                    {/* <Button onClick={joinOnClick} className='border-btn-common'>
                      {dictionary?.common?.join}
                    </Button> */}
                    {/* <Link href={`/${locale}/signup`} className='border-btn-common'>
                      {dictionary?.common?.join}
                    </Link> */}
                  </li>
                  {/* <li> */}
                  {/* <Button onClick={loginOnClick} className='fill-btn-common'>
                      {dictionary?.common?.login}
                    </Button> */}
                  {/* <Link href={`/${locale}/login`} className='fill-btn-common'>
                      {dictionary?.common?.login}
                    </Link>
                  </li> */}
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FrontLayoutHeader
