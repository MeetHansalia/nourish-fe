// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import MenuSelection from '@/views/dashboard/area/order-management/last-moment-cancellation/meal-selection/MenuSelection'

// Meta data
export const metadata = {
  title: 'Menu Selection'
}

// Page
const MenuSelectionPage = async ({ params }) => {
  const { kidId, vendorId } = params

  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <MenuSelection dictionary={dictionary} kidId={kidId} vendorId={vendorId} />
}

export default MenuSelectionPage
