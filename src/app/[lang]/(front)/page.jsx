// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// Views Imports
import LandingPageWrapper from '@views/front/landing'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Metadata
export const metadata = {
  description:
    'Welcome to our landing page! Learn more about our services, explore our products, or get in touch with us today.'
}

/**
 * Page
 */
const LandingPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)
  const mode = getServerMode()

  return <LandingPageWrapper mode={mode} dictionary={dictionary} />
}

export default LandingPage
