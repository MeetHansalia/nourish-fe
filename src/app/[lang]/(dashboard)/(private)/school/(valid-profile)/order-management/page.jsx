// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import SchoolOrderManagementView from '@/views/dashboard/school/order-management/SchoolOrderManagementView'

// Meta data
export const metadata = {
  title: 'Order Management'
}

/**
 * Page
 */
const SchoolOrderManagementPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <SchoolOrderManagementView dictionary={dictionary} />
}

export default SchoolOrderManagementPage
