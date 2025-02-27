// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import MenuNutritionManageList from '@/views/dashboard/state/menu-nutrition-manage/manage-vendor-request-list/MenuNutritionManageList'

// View Imports

// Meta data
export const metadata = {
  title: 'Menu Nutrition Manage'
}

// Page
const MenuNutritionManagePage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <MenuNutritionManageList dictionary={dictionary} />
}

export default MenuNutritionManagePage
