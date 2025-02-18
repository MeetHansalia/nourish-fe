// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import VendorOrderManagementComponent from '@/views/dashboard/vendor/order-management'

// Meta data
export const metadata = {
  title: 'Order Management'
}

const VendorOrderManagemnt = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return <VendorOrderManagementComponent dictionary={dictionary} />
}

export default VendorOrderManagemnt
