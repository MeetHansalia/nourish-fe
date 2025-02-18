// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import WeeklyMenuSelection from '@/views/dashboard/parent/meal-selection/WeeklyMenuSelection'

// Meta data
export const metadata = {
  title: 'Menu Selection'
}

// Page
const WeeklyMenu = async ({ params }) => {
  const { kidId, vendorId } = params

  const dictionary = await getDictionary(params?.lang)

  return <WeeklyMenuSelection dictionary={dictionary} kidId={kidId} vendorId={vendorId} />
}

export default WeeklyMenu
