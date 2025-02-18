// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import WeeklyCheckout from '@/views/dashboard/parent/meal-selection/WeeklyCheckout'

// Meta data
export const metadata = {
  title: 'Checkout'
}

// Page
const WeeklyCart = async ({ params }) => {
  const { kidId, vendorId } = params

  const dictionary = await getDictionary(params?.lang)

  return <WeeklyCheckout dictionary={dictionary} kidId={kidId} />
}

export default WeeklyCart
