// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// Views Imports
import AboutUs from '@views/front/AboutUs'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Metadata
export const metadata = {
  title: 'About Us'
}

/**
 * Page
 */
const AboutUsPage = async ({ params }) => {
  // Vars
  const mode = getServerMode()
  const dictionary = await getDictionary(params?.lang)

  return <AboutUs mode={mode} dictionary={dictionary} />
}

export default AboutUsPage
