import { getDictionary } from '@/utils/getDictionary'

// View Imports
import DateSelection from '@/views/dashboard/staff/meal-selection/DateSelection'

// Meta data
export const metadata = {
  title: 'Date Selection'
}

// Page
const DateSelectionPage = async ({params}) => {

  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <DateSelection dictionary={dictionary} />
}

export default DateSelectionPage
