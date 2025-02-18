// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import SchoolsVendorVerifyComponent from '@/views/dashboard/district/schools-vendor-verify/SchoolsVendorVerifyComponent'

// Meta data
export const metadata = {
  title: 'Order Management'
}

// Page
const SchoolVendorVerify = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return (
    <div>
      <SchoolsVendorVerifyComponent dictionary={dictionary} />
    </div>
  )
}

export default SchoolVendorVerify
