// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import ProfileManagement from '@/views/dashboard/parent/parent-profile'

// Meta data
export const metadata = {
  title: 'Profile Management'
}

// Page
const ProfileManagementPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <ProfileManagement dictionary={dictionary} />
}

export default ProfileManagementPage
