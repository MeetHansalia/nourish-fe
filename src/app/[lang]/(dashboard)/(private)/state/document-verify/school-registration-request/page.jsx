// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import SchoolRegistrationRequestsTable from '@/views/dashboard/state/document-verify-management/school-registration-request/SchoolRegistrationRequestsTable'

// Meta data
export const metadata = {
  title: 'School Registration Request'
}

// Page
const SchoolRegistrationRequestPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return (
    <div>
      <SchoolRegistrationRequestsTable dictionary={dictionary} />
    </div>
  )
}

export default SchoolRegistrationRequestPage
