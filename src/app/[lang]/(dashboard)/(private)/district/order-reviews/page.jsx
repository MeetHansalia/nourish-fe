// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import OrderManagement from '@/views/dashboard/district/order-review/OrderReviewTable'

// Meta data
export const metadata = {
  title: 'Order Reviews'
}

// Page
const ProfileManagementPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <OrderManagement dictionary={dictionary} />
}

export default ProfileManagementPage
