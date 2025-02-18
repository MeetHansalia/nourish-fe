// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import DateSelection from '@/views/dashboard/parent/meal-selection/DateSelection'

// Meta data
export const metadata = {
  title: 'Date Selection'
}

// Page
const DateSelectionPage = async ({ params }) => {
  const { kidId } = params

  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <DateSelection dictionary={dictionary} kidId={kidId} />
}

export default DateSelectionPage
