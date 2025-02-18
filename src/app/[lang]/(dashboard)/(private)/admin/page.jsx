// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import AdminDashboard from '@/views/dashboard/admin/dashboard/index'

// Meta data
export const metadata = {
  title: 'Dashboard'
}

// Page
const DashboardPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return <AdminDashboard dictionary={dictionary} />
}

export default DashboardPage
