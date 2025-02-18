// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// Views Imports
import SignUp from '@views/front/auth/SignUp'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Metadata
export const metadata = {
  title: 'Sign Up',
  description:
    'Create an account to join our community. Sign up today and enjoy exclusive benefits, features, and more!'
}

/**
 * Page
 */
const SignUpPage = async ({ params }) => {
  // Vars
  const mode = getServerMode()
  const dictionary = await getDictionary(params?.lang)

  return <SignUp mode={mode} dictionary={dictionary} />
}

export default SignUpPage
