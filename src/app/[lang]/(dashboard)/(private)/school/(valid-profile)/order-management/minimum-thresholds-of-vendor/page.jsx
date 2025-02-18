// Util Imports
import { getDictionary } from '@/utils/getDictionary'

import MinThresholdsOfVendor from '@/views/dashboard/school/order-management/minimum-thresholds-of-vendor/OrderDataTable'

// Meta data
export const metadata = {
  title: 'Minimum Threshold Requests'
}

const MinimumThresholdsOfVendors = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <MinThresholdsOfVendor dictionary={dictionary} />
}

export default MinimumThresholdsOfVendors
