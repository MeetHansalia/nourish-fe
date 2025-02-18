// MUI Imports
import Button from '@mui/material/Button'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Layout Imports
import LayoutWrapper from '@layouts/LayoutWrapper'
import VerticalLayout from '@layouts/VerticalLayout'
import HorizontalLayout from '@layouts/HorizontalLayout'

// Component Imports
import Providers from '@components/Providers'
import Navigation from '@components/layout/vertical/Navigation'
import Header from '@components/layout/horizontal/Header'
import Navbar from '@components/layout/vertical/Navbar'
import VerticalFooter from '@components/layout/vertical/Footer'
import HorizontalFooter from '@components/layout/horizontal/Footer'
import Customizer from '@core/components/customizer'
import ScrollToTop from '@core/components/scroll-to-top'
import AuthGuard from '@/hocs/AuthGuard'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import { getMode, getSystemMode } from '@core/utils/serverHelpers'
import { USER_ROLE_TO_PANEL_MAPPING } from '@/utils/constants'

// Lib Imports
import { authOptions } from '@/libs/auth'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  // Vars
  const direction = i18n.langDirection[params.lang]
  const dictionary = await getDictionary(params.lang)
  const mode = getMode()
  const systemMode = getSystemMode()

  const NEXT_PUBLIC_IS_APP_DEVELOPMENT_MODE_ON = process.env.NEXT_PUBLIC_IS_APP_DEVELOPMENT_MODE_ON === 'true'

  const session = await getServerSession(authOptions)

  /**
   * super_admin_role,admin_role,
   * state_executive_role, district_executive_role,area_executive_role,
   * school_role,teacher_role,school_otherers_role,
   * parent_role,vendor_role
   */
  // const userRole = 'super_admin_role'

  const userRole = session?.user?.role || ''
  const userPanel = USER_ROLE_TO_PANEL_MAPPING[userRole] || ''

  // console.log('userRole: ', userRole)
  // console.log('userPanel: ', userPanel)

  return (
    <Providers direction={direction}>
      <AuthGuard locale={params.lang}>
        <LayoutWrapper
          systemMode={systemMode}
          verticalLayout={
            <VerticalLayout
              navigation={
                <Navigation
                  dictionary={dictionary}
                  mode={mode}
                  systemMode={systemMode}
                  userRole={userRole}
                  userPanel={userPanel}
                  serverSession={session}
                />
              }
              navbar={<Navbar />}
              footer={<VerticalFooter />}
            >
              {children}
            </VerticalLayout>
          }
          horizontalLayout={
            <HorizontalLayout header={<Header dictionary={dictionary} />} footer={<HorizontalFooter />}>
              {children}
            </HorizontalLayout>
          }
        />
        <ScrollToTop className='mui-fixed'>
          <Button
            variant='contained'
            className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'
          >
            <i className='tabler-arrow-up' />
          </Button>
        </ScrollToTop>

        {NEXT_PUBLIC_IS_APP_DEVELOPMENT_MODE_ON && <Customizer dir={direction} />}
      </AuthGuard>
    </Providers>
  )
}

export default Layout
