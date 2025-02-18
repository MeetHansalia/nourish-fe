// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import DocumentsForVerification from '@/views/dashboard/super-admin/vendor-management/document-verification-requests/DocumentsForVerification'

// Meta data
export const metadata = {
  title: 'Request for Verification Details'
}

const RequestForVerificationDetails = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)
  const { id } = params

  return <DocumentsForVerification dictionary={dictionary} id={id} />
}

export default RequestForVerificationDetails
