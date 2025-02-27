// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import MealSelection from '@/views/dashboard/area/order-management/last-moment-cancellation/meal-selection'

// Meta data
export const metadata = {
  title: 'Meal Selection'
}

// Page
const MealSelectionPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <MealSelection dictionary={dictionary} />
}

export default MealSelectionPage
