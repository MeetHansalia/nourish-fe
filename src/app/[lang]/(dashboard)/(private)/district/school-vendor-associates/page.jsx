// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import SchoolVendor from '@/views/dashboard/district/school-vendor-assosiates'

// View Imports

// Meta data
export const metadata = {
  title: 'School Vendor Management'
}

// Page
const SchoolVendorPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return <SchoolVendor dictionary={dictionary} />
}

export default SchoolVendorPage
