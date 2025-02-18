// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import VendorReview from '@/views/dashboard/super-admin/vendor-management/vendor-review/VendorReview'

// Meta data
export const metadata = {
  title: 'Vendor Review'
}

// Page
const VendorReviewPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <VendorReview dictionary={dictionary} />
}

export default VendorReviewPage
