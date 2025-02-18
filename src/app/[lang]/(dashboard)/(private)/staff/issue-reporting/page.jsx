// Util Imports
import { getDictionary } from '@/utils/getDictionary'
// View Imports
import IssueReporting from '@/views/dashboard/parent/issue-reporting'
// Meta data
export const metadata = {
  title: 'Issue Reporting'
}

// Page
const IssueReportingPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <IssueReporting dictionary={dictionary} />
}

export default IssueReportingPage
