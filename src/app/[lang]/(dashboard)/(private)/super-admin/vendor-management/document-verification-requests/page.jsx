// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import DocumentVerificationTable from '@/views/dashboard/super-admin/vendor-management/document-verification-requests/DocumentVerificationTable'

// Meta data
export const metadata = {
  title: 'Vendor Management'
}

const DocumentVerificationRequests = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <DocumentVerificationTable dictionary={dictionary} />
}

export default DocumentVerificationRequests
