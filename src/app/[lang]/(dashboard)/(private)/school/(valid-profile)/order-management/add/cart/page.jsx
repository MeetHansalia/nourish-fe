// View Imports
import AddToCartForSchoolView from '@/views/dashboard/school/order-management/AddToCartForSchoolView'
// Meta data
export const metadata = {
  title: 'Order Management'
}

// Page
const AddToCartEventOrderForSchool = async ({ params }) => {
  return <AddToCartForSchoolView />
}

export default AddToCartEventOrderForSchool
