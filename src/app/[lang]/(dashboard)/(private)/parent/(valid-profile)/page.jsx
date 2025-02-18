// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import ParentDashboard from '@/views/dashboard/parent/dashboard/index'

// Meta data
export const metadata = {
  title: 'Dashboard'
}

// Page
const DashboardPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return <ParentDashboard dictionary={dictionary} />
}

export default DashboardPage
