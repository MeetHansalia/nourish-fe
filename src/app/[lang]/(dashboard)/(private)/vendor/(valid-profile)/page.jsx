// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import VendorDashboard from '@/views/dashboard/vendor/dashboard'
// import VendorDashboard from '@/views/dashboard/vendor'

// Meta data
export const metadata = {
  title: 'Dashboard'
}

// Page
const DashboardPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return (
    <div>
      {/* <h1>Vendor: {dictionary['navigation']?.dashboard} page!</h1> */}
      <VendorDashboard />
    </div>
  )
}

export default DashboardPage
