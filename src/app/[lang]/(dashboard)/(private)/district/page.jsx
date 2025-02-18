// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import DistrictDashboard from '@/views/dashboard/district/dashboard/index'

// Meta data
export const metadata = {
  title: 'Dashboard'
}

// Page
const DashboardPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return <DistrictDashboard dictionary={dictionary} />
}

export default DashboardPage
