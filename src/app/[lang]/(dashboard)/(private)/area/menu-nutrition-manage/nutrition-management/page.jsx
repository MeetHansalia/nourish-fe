// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import DateSelection from '@/views/dashboard/area/menu-nutrition-manage/nutrition-management'

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
      <DateSelection dictionary={dictionary} />
    </div>
  )
}

export default MenuNutritionManage
