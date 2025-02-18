// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import AddUpdateKid from '@/views/dashboard/parent/kid-profile-management/AddUpdateKid'

// Meta data
export const metadata = {
  title: 'Kid Management | Update Kid'
}

// Page
const KidManagementUpdatePage = async ({ params, searchParams }) => {
  const { id } = params

  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <AddUpdateKid dictionary={dictionary} id={id} />
}

export default KidManagementUpdatePage
