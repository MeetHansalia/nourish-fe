// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// Views Imports
import ContactUsInquiries from '@views/front/ContactUsInquiries'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Metadata
export const metadata = {
  title: 'Contact Us Inquiries'
}

/**
 * Page
 */
const ContactUsInquiriesPage = async ({ params }) => {
  // Vars
  const mode = getServerMode()
  const dictionary = await getDictionary(params?.lang)

  return <ContactUsInquiries mode={mode} dictionary={dictionary} />
}

export default ContactUsInquiriesPage
