// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import StaffManagementComponent from '@/views/dashboard/school/staff-management'

// Meta data
export const metadata = {
  title: 'Staff Management'
}

// Page
const StaffManagementPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  //   return <VendorManagement dictionary={dictionary} />
  return <StaffManagementComponent dictionary={dictionary} />
}

export default StaffManagementPage
