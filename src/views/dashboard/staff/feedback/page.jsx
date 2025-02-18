import { Stack } from '@mui/material'

import OrderDataTable from './OrderDataTable'

const FeedbackComponent = props => {
  const { dictionary = null } = props

  return (
    <Stack spacing={5}>
      <OrderDataTable dictionary={dictionary} />
    </Stack>
  )
}

export default FeedbackComponent
