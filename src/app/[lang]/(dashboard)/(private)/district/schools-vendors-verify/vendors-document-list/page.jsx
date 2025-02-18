// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import VendorRegistrationRequestsTable from '@/views/dashboard/district/schools-vendor-verify/vendor-registration-request/VendorRegistrationRequestsTable'

// Meta data
export const metadata = {
  title: 'Vendor Document List'
}

const VendorsDocumentList = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return (
    <>
      <VendorRegistrationRequestsTable dictionary={dictionary} />
    </>
  )
}

export default VendorsDocumentList
