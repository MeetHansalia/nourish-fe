// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import ParentRegistrationRequestsTable from '@/views/dashboard/school/parent-registration-request/ParentRegistrationRequestsTable'

// Meta data
export const metadata = {
  title: 'Dashboard'
}

// Page
const DashboardPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return <ParentRegistrationRequestsTable dictionary={dictionary} />
}

export default DashboardPage
