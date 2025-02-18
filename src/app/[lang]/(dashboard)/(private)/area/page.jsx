// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import AreaDashboard from '@/views/dashboard/area/dashboard/index'

// Meta data
export const metadata = {
  title: 'Dashboard'
}

// Page
const DashboardPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return <AreaDashboard dictionary={dictionary} />
}

export default DashboardPage
