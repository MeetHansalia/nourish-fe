// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import WeeklyMenuSelection from '@/views/dashboard/staff/meal-selection/WeeklyMenuSelection'

// Meta data
export const metadata = {
  title: 'Menu Selection'
}

// Page
const WeeklyMenu = async ({ params }) => {
  const { vendorId } = params

  const dictionary = await getDictionary(params?.lang)

  return <WeeklyMenuSelection dictionary={dictionary} vendorId={vendorId} />
}

export default WeeklyMenu
