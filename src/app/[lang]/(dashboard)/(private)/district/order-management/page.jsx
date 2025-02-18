// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import OrderManagement from '@/views/dashboard/district/order-management'

// Meta data
export const metadata = {
  title: 'Order Management'
}

// Page
const OrderManagementPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return (
    <div>
      <OrderManagement dictionary={dictionary} />
    </div>
  )
}

export default OrderManagementPage
