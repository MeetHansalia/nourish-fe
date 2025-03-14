// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import ProfileManagement from '@/views/dashboard/vendor/profile-management'

// Meta data
export const metadata = {
  title: 'Vendor Profile'
}

// Page
const ParentProfilePage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <ProfileManagement dictionary={dictionary} />
}

export default ParentProfilePage
