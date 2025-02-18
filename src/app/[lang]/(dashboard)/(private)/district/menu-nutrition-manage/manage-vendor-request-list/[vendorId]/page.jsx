// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import MenuNutritionSelection from '@/views/dashboard/district/menu-nutrition-manage/menu-nutrition-manage-meal-seaction/Menu-Nutrition-Selection'

// View Imports

// Meta data
export const metadata = {
  title: 'Menu Nutrition Manage'
}

// Page
const MenuNutritionManagePage = async ({ params }) => {
  console.log('params', params)
  const { vendorId } = params
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <MenuNutritionSelection dictionary={dictionary} vendorId={vendorId} />
}

export default MenuNutritionManagePage
