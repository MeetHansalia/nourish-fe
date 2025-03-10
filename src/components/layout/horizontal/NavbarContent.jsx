'use client'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import Logo from '@components/layout/shared/Logo'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'
import { getLocalizedUrl } from '@/utils/i18n'
import NotificationDropdown from '@/components/NotificationsDropdown'

const NavbarContent = () => {
  // Hooks
  const { isBreakpointReached } = useHorizontalNav()
  const { lang: locale } = useParams()

  const notifications = [
    {
      avatarImage: '/images/avatars/8.png',
      title: 'Congratulations Flora 🎉',
      subtitle: 'Won the monthly bestseller gold badge',
      time: '1h ago',
      read: false
    },
    {
      title: 'Cecilia Becker',
      avatarColor: 'secondary',
      subtitle: 'Accepted your connection',
      time: '12h ago',
      read: false
    },
    {
      avatarImage: '/images/avatars/3.png',
      title: 'Bernard Woods',
      subtitle: 'You have new message from Bernard Woods',
      time: 'May 18, 8:26 AM',
      read: true
    },
    {
      avatarIcon: 'tabler-chart-bar',
      title: 'Monthly report generated',
      subtitle: 'July month financial report is generated',
      avatarColor: 'info',
      time: 'Apr 24, 10:30 AM',
      read: true
    },
    {
      avatarText: 'MG',
      title: 'Application has been approved 🚀',
      subtitle: 'Your Meta Gadgets project application has been approved.',
      avatarColor: 'success',
      time: 'Feb 17, 12:17 PM',
      read: true
    },
    {
      avatarIcon: 'tabler-mail',
      title: 'New message from Harry',
      subtitle: 'You have new message from Harry',
      avatarColor: 'error',
      time: 'Jan 6, 1:48 PM',
      read: true
    }
  ]

  return (
    <div
      className={classnames(horizontalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}
    >
      <div className='flex items-center gap-4'>
        <NavToggle />
        {/* Hide Logo on Smaller screens */}
        {/* {!isBreakpointReached && <Logo />} */}
        {!isBreakpointReached && (
          <Link href={getLocalizedUrl('/', locale)}>
            <Logo />
          </Link>
        )}
      </div>
      <div className='flex items-center'>
        <NotificationDropdown />

        <LanguageDropdown />
        {/* <ModeDropdown /> */}
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
