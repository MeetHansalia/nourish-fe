// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import DocumentVerificationTable from '@/views/dashboard/admin/vendor-management/vendor-document-requests/VendorDocumentRequestComponent'

// Meta data
export const metadata = {
  title: 'Request for Verification Details'
}

const RequestForVerificationDetails = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)
  const { id } = params

  return (
    <>
      <DocumentVerificationTable dictionary={dictionary} id={id} />
    </>
  )
}

export default RequestForVerificationDetails
