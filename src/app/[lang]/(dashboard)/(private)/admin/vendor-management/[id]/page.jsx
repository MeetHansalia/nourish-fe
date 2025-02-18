// View Imports
import { getDictionary } from '@/utils/getDictionary'

// Component Imports
import VendorProfile from '@/views/dashboard/admin/vendor-management/VendorProfile'

// Meta data
export const metadata = {
  title: 'Vendor Details'
}

// Page
const VendorDetails = async ({ params }) => {
  const { id } = params

  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <VendorProfile id={id} dictionary={dictionary} />
}

export default VendorDetails
