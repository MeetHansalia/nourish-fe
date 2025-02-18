// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// Views Imports
import SchoolSignUp from '@/views/front/auth/SchoolSignUp'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Metadata
export const metadata = {
  title: 'School Sign Up',
  description: 'Register your school with us'
}

/**
 * Page
 */
const SchoolSignUpPage = async ({ params }) => {
  // Vars
  const mode = getServerMode()
  const dictionary = await getDictionary(params?.lang)

  return <SchoolSignUp mode={mode} dictionary={dictionary} />
}

export default SchoolSignUpPage
