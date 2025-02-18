// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import StaffDashboard from '@/views/dashboard/staff/dashboard/index'

// Meta data
export const metadata = {
  title: 'Dashboard'
}

// Page
const DashboardPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return <StaffDashboard dictionary={dictionary} />
}

export default DashboardPage
