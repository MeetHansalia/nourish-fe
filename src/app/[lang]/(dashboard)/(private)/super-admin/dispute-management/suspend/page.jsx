// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports

import Suspend from '@/views/dashboard/super-admin/dispute-management/Suspend'

// Meta data
export const metadata = {
  title: 'Dispute Suspend'
}

// Page
const DisputeSuspendPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <Suspend dictionary={dictionary} />
}

export default DisputeSuspendPage
