import { getDictionary } from '@/utils/getDictionary'
import OrderTrackingView from '@/views/dashboard/school/order-traking/OrderTrackingView'

const ReviewPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <OrderTrackingView dictionary={dictionary} />
}

export default ReviewPage
