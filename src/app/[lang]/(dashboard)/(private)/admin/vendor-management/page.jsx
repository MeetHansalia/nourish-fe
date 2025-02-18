// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import VendorManagementComponent from '@/views/dashboard/admin/vendor-management'

// Meta data
export const metadata = {
  title: 'Order Management'
}

// Page
const VendorManagementPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return (
    <>
      <VendorManagementComponent dictionary={dictionary} />
    </>
  )
}

export default VendorManagementPage
