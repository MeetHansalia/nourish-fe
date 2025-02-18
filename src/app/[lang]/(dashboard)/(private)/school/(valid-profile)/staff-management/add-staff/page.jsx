// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import AddStaffFormComponent from '@/views/dashboard/school/staff-management/AddStaffForm'

// Meta data
export const metadata = {
  title: 'Add staff'
}

// Page
const StaffManagementPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <AddStaffFormComponent dictionary={dictionary} />
}

export default StaffManagementPage
