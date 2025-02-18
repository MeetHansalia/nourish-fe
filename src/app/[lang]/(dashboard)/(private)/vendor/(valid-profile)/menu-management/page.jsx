// Util Imports
import { getDictionary } from '@/utils/getDictionary'
// View Imports
import MenuManagement from '@/views/dashboard/vendor/menu-management'
// Meta data
export const metadata = {
  title: 'Menu Management'
}

// Page
const MenuManagementPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <MenuManagement dictionary={dictionary} />
}

export default MenuManagementPage
