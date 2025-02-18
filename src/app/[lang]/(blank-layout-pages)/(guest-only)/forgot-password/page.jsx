// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import ForgotPassword from '@/views/blank-layout-pages/ForgotPassword'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Metadata
export const metadata = {
  title: 'Forgot Password'
}

/**
 * Page
 */
const ForgotPasswordPage = async ({ params }) => {
  // Vars
  const mode = getServerMode()
  const dictionary = await getDictionary(params?.lang)

  return <ForgotPassword mode={mode} dictionary={dictionary} />
}

export default ForgotPasswordPage
