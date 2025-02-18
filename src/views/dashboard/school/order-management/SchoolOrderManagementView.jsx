// MUI Imports
import { Grid, Stack } from '@mui/material'

// View Imports
import OrderStatistics from './OrderStatistics'
import OrderDataTable from './OrderDataTable'

const SchoolOrderManagementView = props => {
  const { dictionary = null } = props

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <OrderStatistics dictionary={dictionary} />
      </Grid>
      <Grid item xs={12}>
        <OrderDataTable dictionary={dictionary} />
      </Grid>
    </Grid>
  )
}

export default SchoolOrderManagementView
