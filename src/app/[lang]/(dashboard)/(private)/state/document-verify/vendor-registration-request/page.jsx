// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import VendorRegistrationRequestsTable from '@/views/dashboard/state/document-verify-management/vendor-registration-request/VendorRegistrationRequestsTable'

const VendorRegistrationRequest = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return (
    <>
      <VendorRegistrationRequestsTable dictionary={dictionary} />
    </>
  )
}

export default VendorRegistrationRequest
