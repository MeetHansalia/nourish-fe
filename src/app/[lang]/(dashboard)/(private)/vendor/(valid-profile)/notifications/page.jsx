// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import Notifications from '@/views/dashboard/vendor/notifications'

// Meta data
export const metadata = {
  title: 'Notifications List '
}

const NotificationListPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return (
    <>
      <Notifications dictionary={dictionary} />
    </>
  )
}

export default NotificationListPage
