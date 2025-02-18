// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import ManageVendorRequest from '@/views/dashboard/state/manage-vendor-request/ManageVendorRequestTable'

// View Imports

// Meta data
export const metadata = {
  title: 'Vendor request'
}

// Page
const ManageVendorRequestPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return (
    <div>
      <ManageVendorRequest dictionary={dictionary} />
    </div>
  )
}

export default ManageVendorRequestPage
