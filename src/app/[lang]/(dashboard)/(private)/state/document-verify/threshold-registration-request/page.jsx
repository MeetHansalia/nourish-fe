// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import VendorThresholdRegistrationRequests from '@/views/dashboard/state/document-verify-management/threshold-registration-request/ThresholdRegistrationRequestTable'

// Meta data
export const metadata = {
  title: 'Document Verification'
}

// Page
const DocumentVerifyPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return (
    <>
      <VendorThresholdRegistrationRequests dictionary={dictionary} />
    </>
  )
}

export default DocumentVerifyPage
