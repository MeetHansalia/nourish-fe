// Util Imports
import { getDictionary } from '@/utils/getDictionary'
// View Imports
import DisputeManagement from '@/views/dashboard/vendor/dispute-management'
// Meta data
export const metadata = {
  title: 'Dispute Management'
}

// Page
const IssueReportingPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <DisputeManagement dictionary={dictionary} />
}

export default IssueReportingPage
