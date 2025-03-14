// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import CreateUser from '@/views/dashboard/state/user-management/CreateUser'

// Meta data
export const metadata = {
  title: 'User Management | User Update'
}

/**
 * Page
 */
const UserManagementCreatePage = async ({ params, searchParams }) => {
  // Params
  const { id } = params

  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <CreateUser dictionary={dictionary} id={id} />
}

export default UserManagementCreatePage
