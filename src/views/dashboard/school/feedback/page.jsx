import { Stack } from '@mui/material'

import OrderDataTable from './OrderDataTable'

const FeedbackComponent = props => {
  const { dictionary = null } = props

  return <OrderDataTable dictionary={dictionary} />
}

export default FeedbackComponent
