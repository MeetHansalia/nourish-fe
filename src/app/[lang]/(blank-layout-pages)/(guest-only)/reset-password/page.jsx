// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import ResetPassword from '@/views/blank-layout-pages/ResetPassword'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Metadata
export const metadata = {
  title: 'Reset Password'
}

/**
 * Page
 */
const ResetPasswordPage = async ({ params }) => {
  // Vars
  const mode = getServerMode()
  const dictionary = await getDictionary(params?.lang)

  return <ResetPassword mode={mode} dictionary={dictionary} />
}

export default ResetPasswordPage
