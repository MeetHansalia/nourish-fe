// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import VendorRegistrationRequestsTable from '@/views/dashboard/admin/vendor-management/vendor-document-requests/VendorRegistrationRequestsTable'

// Meta data
export const metadata = {
  title: 'Order Management'
}

const VendorDocumentRequestsPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return (
    <>
      <VendorRegistrationRequestsTable dictionary={dictionary} />
    </>
  )
}

export default VendorDocumentRequestsPage
