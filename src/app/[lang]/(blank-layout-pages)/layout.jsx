// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Component Imports
import Customizer from '@core/components/customizer'

const Layout = ({ children }) => {
  // Vars
  const direction = 'ltr'
  const systemMode = getSystemMode()

  const NEXT_PUBLIC_IS_APP_DEVELOPMENT_MODE_ON = (process.env.NEXT_PUBLIC_IS_APP_DEVELOPMENT_MODE_ON === 'true')

  return (
    <Providers direction={direction}>
      <BlankLayout systemMode={systemMode}>{children}</BlankLayout>

      {NEXT_PUBLIC_IS_APP_DEVELOPMENT_MODE_ON && <Customizer dir={direction} />}
    </Providers>
  )
}

export default Layout
