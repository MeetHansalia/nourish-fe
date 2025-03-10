// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import SpecialEventOrders from '@/views/dashboard/vendor/order-management/SpecialEventOrders'

// Meta data
export const metadata = {
  title: 'Order Management'
}

const VendorOrderManagemnt = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return <SpecialEventOrders dictionary={dictionary} />
}

export default VendorOrderManagemnt
