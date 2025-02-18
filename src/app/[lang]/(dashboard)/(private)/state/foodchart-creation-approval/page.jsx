// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import FoodChartCreationTable from '@/views/dashboard/state/foodchart-creation-approval/FoodChartCreationTable'

// Meta data
export const metadata = {
  title: 'Order Management'
}

const FoodChartTablePage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return (
    <>
      <FoodChartCreationTable dictionary={dictionary} />
    </>
  )
}

export default FoodChartTablePage
