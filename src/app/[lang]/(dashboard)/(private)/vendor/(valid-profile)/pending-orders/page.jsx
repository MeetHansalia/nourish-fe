// Util Imports
import { getDictionary } from '@/utils/getDictionary'

import PendingOrdersListing from '@/views/dashboard/vendor/dashboard/pending-orders'

const PendingOrdersTable = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return (
    <>
      <PendingOrdersListing dictionary={dictionary} />
    </>
  )
}

export default PendingOrdersTable
