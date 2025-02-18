// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import SuperAdminDashboard from '@/views/dashboard/super-admin/dashboard/index'

// Meta data
export const metadata = {
  title: 'Dashboard'
}

// Page
const DashboardPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return <SuperAdminDashboard dictionary={dictionary} />
}

export default DashboardPage
