// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import VendorManagementComponent from '@/views/dashboard/admin/vendor-management'

// View Imports
import OrderDataTable from '@/views/dashboard/admin/vendor-management/vendor-minimum-threshold/MinimumThresholdTable'

// Meta data
export const metadata = {
  title: 'Order Management'
}

// Page
const VendorMinimumThresholdRequest = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return (
    <>
      <OrderDataTable dictionary={dictionary} />
    </>
  )
}

export default VendorMinimumThresholdRequest
