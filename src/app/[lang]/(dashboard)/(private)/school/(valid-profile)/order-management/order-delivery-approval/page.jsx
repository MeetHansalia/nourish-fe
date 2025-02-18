// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import OrderDeliveryApproval from '@/views/dashboard/school/order-management/order-delivery-approval/OrderDataTable'

// Meta data
export const metadata = {
  title: 'OrderDeliveryApproval'
}

const orderDeliveryApproval = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <OrderDeliveryApproval dictionary={dictionary} />
}

export default orderDeliveryApproval
