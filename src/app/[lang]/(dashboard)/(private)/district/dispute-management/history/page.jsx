// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import DisputeHistory from '@/views/dashboard/district/dispute-management/DisputeHistory'

// Meta data
export const metadata = {
  title: 'Dispute History'
}

// Page
const DisputeListPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <DisputeHistory dictionary={dictionary} />
}

export default DisputeListPage
