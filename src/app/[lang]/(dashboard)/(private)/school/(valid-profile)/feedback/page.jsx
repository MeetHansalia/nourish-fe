import { getDictionary } from '@/utils/getDictionary'
import FeedbackComponent from '@/views/dashboard/school/feedback/page'

const FeedbackPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return (
    <>
      <FeedbackComponent dictionary={dictionary} />
    </>
  )
}

export default FeedbackPage
