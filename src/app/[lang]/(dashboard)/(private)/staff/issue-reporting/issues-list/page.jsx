// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import IssueList from '@/views/dashboard/parent/issue-reporting/IssueList'

// Meta data
export const metadata = {
  title: 'Issue Reporting'
}

// Page
const IssueListPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <IssueList dictionary={dictionary} />
}

export default IssueListPage
