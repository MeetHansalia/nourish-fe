import { getDictionary } from '@/utils/getDictionary'
import ReviewForMealView from '@/views/dashboard/parent/reviews-for-meals/ReviewForMealView'

const ReviewPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <ReviewForMealView dictionary={dictionary} />
}

export default ReviewPage
