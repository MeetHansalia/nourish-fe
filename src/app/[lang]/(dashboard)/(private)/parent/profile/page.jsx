// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import ParentProfile from '@/views/dashboard/parent/profile'

// Meta data
export const metadata = {
  title: 'Parent Profile'
}

// Page
const ParentProfilePage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <ParentProfile dictionary={dictionary} />
}

export default ParentProfilePage
