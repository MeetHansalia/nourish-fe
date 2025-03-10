// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import CancleOrderRequest from '@/views/dashboard/vendor/order-management/CancleOrderRequest'

// Meta data
export const metadata = {
  title: 'Order Management'
}

const VendorOrderManagemnt = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return <CancleOrderRequest dictionary={dictionary} />
}

export default VendorOrderManagemnt
