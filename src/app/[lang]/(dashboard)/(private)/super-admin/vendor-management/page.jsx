// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import VendorManagement from '@/views/dashboard/super-admin/vendor-management'

// Meta data
export const metadata = {
  title: 'Vendor Management'
}

// Page
const VendorManagementPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <VendorManagement dictionary={dictionary} />
}

export default VendorManagementPage
