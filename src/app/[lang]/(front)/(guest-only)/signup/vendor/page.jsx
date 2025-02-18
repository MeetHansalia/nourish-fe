// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// Views Imports
import VendorSignUp from '@/views/front/auth/VendorSignUp'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Metadata
export const metadata = {
  title: 'Vendor Sign Up ',
  description:
    'Become a vendor and start selling your products on our platform. Join us today and reach thousands of customers!'
}

/**
 * Page
 */
const VendorSignUpPage = async ({ params }) => {
  // Vars
  const mode = getServerMode()
  const dictionary = await getDictionary(params?.lang)

  return <VendorSignUp mode={mode} dictionary={dictionary} />
}

export default VendorSignUpPage
