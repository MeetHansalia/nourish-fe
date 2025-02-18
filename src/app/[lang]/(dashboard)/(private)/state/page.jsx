// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import StateDashboard from '@/views/dashboard/state/dashboard/index'

// Meta data
export const metadata = {
  title: 'Dashboard'
}

// Page
const DashboardPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return <StateDashboard dictionary={dictionary} />
}

export default DashboardPage
