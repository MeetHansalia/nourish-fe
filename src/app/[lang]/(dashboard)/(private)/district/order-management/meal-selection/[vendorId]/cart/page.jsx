// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import CheckOutPage from '@/views/dashboard/district/order-management/last-moment-cancellation/meal-selection/CheckOutPage'

// Meta data
export const metadata = {
  title: 'CheckOut Selection'
}

// Page
const Checkout = async ({ params }) => {
  const { vendorId } = params

  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <CheckOutPage dictionary={dictionary} vendorId={vendorId} />
}

export default Checkout
