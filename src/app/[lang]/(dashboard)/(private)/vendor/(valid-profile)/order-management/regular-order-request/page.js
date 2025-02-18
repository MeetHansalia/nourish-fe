// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import RegularOrderRequest from '@/views/dashboard/vendor/order-management/RegularOrderRequest'

// Meta data
export const metadata = {
  title: 'Order Management'
}

const VendorOrderManagemnt = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return <RegularOrderRequest dictionary={dictionary} />
}

export default VendorOrderManagemnt
