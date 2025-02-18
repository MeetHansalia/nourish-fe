// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import WeeklyCheckout from '@/views/dashboard/staff/meal-selection/WeeklyCheckout'

// Meta data
export const metadata = {
  title: 'Checkout'
}

// Page
const WeeklyCart = async ({ params }) => {
  const { vendorId } = params

  const dictionary = await getDictionary(params?.lang)

  return <WeeklyCheckout dictionary={dictionary} />
}

export default WeeklyCart
