// Util Imports
import { getDictionary } from '@/utils/getDictionary'
// View Imports
import AddEventOrderForSchoolView from '@/views/dashboard/school/order-management/AddEventOrderForSchoolView'
// Meta data
export const metadata = {
  title: 'Order Management'
}

// Page
const AddEventOrderForSchool = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <AddEventOrderForSchoolView dictionary={dictionary} />
}

export default AddEventOrderForSchool
