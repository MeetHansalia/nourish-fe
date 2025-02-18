// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import UserManagement from '@/views/dashboard/super-admin/user-management'

// Meta data
export const metadata = {
  title: 'User Management'
}

// Page
const UserManagementPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <UserManagement dictionary={dictionary} />
}

export default UserManagementPage
