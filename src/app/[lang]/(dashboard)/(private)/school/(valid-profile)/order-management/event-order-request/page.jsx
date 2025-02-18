// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import EventOrderDataTable from '@/views/dashboard/school/order-management/event-order-request/OrderDataTable'

// Meta data
export const metadata = {
  title: 'Event Order Requests'
}

const EventOrderManagement = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return (
    <>
      <EventOrderDataTable dictionary={dictionary} />
    </>
  )
}

export default EventOrderManagement
