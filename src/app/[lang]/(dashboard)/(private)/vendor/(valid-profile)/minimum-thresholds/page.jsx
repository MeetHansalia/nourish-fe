// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import VendorThresholdComponent from '@/views/dashboard/vendor/dashboard/minimum-thresholds/VendorThresholdComponent'

// Meta data
export const metadata = {
  title: 'Minimum thresholds '
}

const MinimumThresholdsRequestsPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return (
    <>
      <VendorThresholdComponent dictionary={dictionary} />
    </>
  )
}

export default MinimumThresholdsRequestsPage
