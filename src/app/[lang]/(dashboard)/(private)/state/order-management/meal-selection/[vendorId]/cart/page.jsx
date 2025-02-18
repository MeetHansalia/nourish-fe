// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import CheckOutPage from '@/views/dashboard/parent/meal-selection/CheckOutPage'

// Meta data
export const metadata = {
  title: 'CheckOut Selection'
}

// Page
const Checkout = async ({ params }) => {
  const { kidId, vendorId } = params

  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <CheckOutPage dictionary={dictionary} kidId={kidId} vendorId={vendorId} />
}

export default Checkout
