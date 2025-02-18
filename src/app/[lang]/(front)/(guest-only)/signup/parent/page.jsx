// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// Views Imports
import ParentSignUp from '@/views/front/auth/ParentSignUp'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Metadata
export const metadata = {
  title: 'Parent Sign Up',
  description: 'Join us as a parent.'
}

/**
 * Page
 */
const ParentSignUpPage = async ({ params }) => {
  // Vars
  const mode = getServerMode()
  const dictionary = await getDictionary(params?.lang)

  return <ParentSignUp mode={mode} dictionary={dictionary} />
}

export default ParentSignUpPage
