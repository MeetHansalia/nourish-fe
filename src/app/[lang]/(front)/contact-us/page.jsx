// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// Views Imports
import ContactUs from '@views/front/ContactUs'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Metadata
export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with us for inquiries, support, or feedback. Our team is here to help you!'
}

/**
 * Page
 */
const ContactUsPage = async ({ params }) => {
  // Vars
  const mode = getServerMode()
  const dictionary = await getDictionary(params?.lang)

  return <ContactUs mode={mode} dictionary={dictionary} />
}

export default ContactUsPage
