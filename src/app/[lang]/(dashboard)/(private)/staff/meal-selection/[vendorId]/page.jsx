// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import MenuSelection from '@/views/dashboard/staff/meal-selection/MenuSelection'

// Meta data
export const metadata = {
  title: 'Menu Selection'
}

// Page
const MenuSelectionPage = async ({ params }) => {
  const { vendorId } = params

  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <MenuSelection dictionary={dictionary} vendorId={vendorId} />
}

export default MenuSelectionPage
