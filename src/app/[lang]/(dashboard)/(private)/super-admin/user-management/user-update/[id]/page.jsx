// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import CreateUser from '@/views/dashboard/super-admin/user-management/CreateUser'

// Meta data
export const metadata = {
  title: 'User Management | User Update'
}

// Page
const UserManagementCreatePage = async ({ params, searchParams }) => {
  // const { id } = searchParams
  const { id } = params

  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <CreateUser dictionary={dictionary} id={id} />
}

export default UserManagementCreatePage
