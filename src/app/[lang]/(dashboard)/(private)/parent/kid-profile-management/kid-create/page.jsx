// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import AddUpdateKid from '@/views/dashboard/parent/kid-profile-management/AddUpdateKid'

// Meta data
export const metadata = {
  title: 'Kid Management | Add Kid'
}

// Page
const KidManagementAddPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <AddUpdateKid dictionary={dictionary} />
}

export default KidManagementAddPage
