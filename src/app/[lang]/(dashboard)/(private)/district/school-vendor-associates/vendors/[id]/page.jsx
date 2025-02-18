// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import ProfileManagement from '@/views/dashboard/district/school-vendor-assosiates/vendors/[id]/index'

// Meta data
export const metadata = {
  title: 'Profile Management'
}

// Page
const ProfileManagementPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <ProfileManagement dictionary={dictionary} params={params} />
}

export default ProfileManagementPage
