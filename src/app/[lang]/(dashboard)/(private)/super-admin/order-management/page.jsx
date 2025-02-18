// Util Imports
import { getDictionary } from '@/utils/getDictionary'
// View Imports
import OrderManagement from '@/views/dashboard/super-admin/order-management'
// Meta data
export const metadata = {
  title: 'Order Management'
}

// Page
const OrderManagementPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <OrderManagement dictionary={dictionary} />
}

export default OrderManagementPage
