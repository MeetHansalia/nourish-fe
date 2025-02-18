// Component Imports
import Link from 'next/link'

// Third-party Imports
import { getServerSession } from 'next-auth/next'

import Providers from '@components/Providers'
import FrontLayout from '@components/layout/front/FrontLayout'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import { getSystemMode } from '@core/utils/serverHelpers'

// Component Imports
import Customizer from '@core/components/customizer'

// Lib Imports
import { authOptions } from '@/libs/auth'

/**
 * Page
 */
const Layout = async ({ children, params }) => {
  // Vars
  const direction = i18n.langDirection[params.lang]
  const dictionary = await getDictionary(params.lang)
  const systemMode = getSystemMode()
  const session = await getServerSession(authOptions)

  const NEXT_PUBLIC_IS_APP_DEVELOPMENT_MODE_ON = process.env.NEXT_PUBLIC_IS_APP_DEVELOPMENT_MODE_ON === 'true'

  return (
    <Providers direction={direction}>
      <FrontLayout systemMode={systemMode} dictionary={dictionary} session={session}>
        {children}
      </FrontLayout>

      {NEXT_PUBLIC_IS_APP_DEVELOPMENT_MODE_ON && <Customizer dir={direction} />}
    </Providers>
  )
}

export default Layout
