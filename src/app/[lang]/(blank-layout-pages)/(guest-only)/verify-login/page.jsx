// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import VerifyLogin from '@/views/blank-layout-pages/VerifyLogin'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Metadata
export const metadata = {
  title: 'Login'
}

/**
 * Page
 */
const VerifyLoginPage = async ({ params }) => {
  // Vars
  const mode = getServerMode()
  const dictionary = await getDictionary(params?.lang)

  return <VerifyLogin mode={mode} dictionary={dictionary} />
}

export default VerifyLoginPage
