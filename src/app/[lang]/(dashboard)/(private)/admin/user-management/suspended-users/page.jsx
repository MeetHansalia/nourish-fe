// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import SuspendedUsers from '@/views/dashboard/admin/user-management/SuspendedUsers'

// Meta data
export const metadata = {
  title: 'Suspended Users'
}

/**
 * Page
 */
const UserSuspendedPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <SuspendedUsers dictionary={dictionary} />
}

export default UserSuspendedPage
