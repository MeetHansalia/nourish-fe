// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import CreateUser from '@/views/dashboard/state/user-management/CreateUser'

// Meta data
export const metadata = {
  title: 'User Management | User Create'
}

/**
 * Page
 */
const UserManagementCreatePage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <CreateUser dictionary={dictionary} />
}

export default UserManagementCreatePage
