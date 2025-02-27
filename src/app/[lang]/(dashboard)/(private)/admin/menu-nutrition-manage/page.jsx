// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import MenuNutritionManagement from '@/views/dashboard/admin/menu-nutrition-manage'

// View Imports

// Meta data
export const metadata = {
  title: 'Vendor request'
}

// Page
const MenuNutritionManage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return (
    <div>
      <MenuNutritionManagement dictionary={dictionary} />
    </div>
  )
}

export default MenuNutritionManage
