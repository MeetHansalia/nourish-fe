// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import FoodChartCreation from '@/views/dashboard/district/food-chart-creation/new-food-chart-creation'

// Meta data
export const metadata = {
  title: 'Food chart creation Calendar'
}

const FoodChartTablePage = async ({ params }) => {
  // const { id } = params
  const dictionary = await getDictionary(params?.lang)

  return (
    <>
      <FoodChartCreation dictionary={dictionary} />
    </>
  )
}

export default FoodChartTablePage
