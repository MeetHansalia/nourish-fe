// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import OrderDataTable from '@/views/dashboard/super-admin/vendor-management/vendor-threshold/OrderDataTable'

// Meta data
export const metadata = {
  title: 'Vendor Mininimum Threshold Verification'
}

// Page
const VendorReviewPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <OrderDataTable dictionary={dictionary} />
}

export default VendorReviewPage
