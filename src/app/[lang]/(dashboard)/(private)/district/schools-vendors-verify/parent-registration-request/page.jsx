// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import ParentRegistrationRequestsTable from '@/views/dashboard/district/schools-vendor-verify/parent-registration-request/ParentRegistrationRequestsTable'

// Meta data
export const metadata = {
  title: 'Parent Registration Request'
}

// Page
const ParentRegistrationRequestPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return (
    <div>
      <ParentRegistrationRequestsTable dictionary={dictionary} />
    </div>
  )
}

export default ParentRegistrationRequestPage
