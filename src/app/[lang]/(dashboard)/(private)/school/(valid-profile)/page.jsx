// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import SchoolDashboard from '@/views/dashboard/school/dashboard/index'

// Meta data
export const metadata = {
  title: 'Dashboard'
}

// Page
const DashboardPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return <SchoolDashboard dictionary={dictionary} />
}

export default DashboardPage
