'use client'

import { Box, Button, CardContent, Grid, Typography } from '@mui/material'

const OrdersCard = ({ allOrdersListData, handleOpenDialog }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <Typography variant='body2'>Address: {allOrdersListData?.deliveryAddress}</Typography>
        <Typography variant='body2'>Delivery Type: {allOrdersListData?.deliveryType}</Typography>
        <Typography variant='body2'>Order Type: {allOrdersListData?.orderType}</Typography>
      </Grid>
      <Grid item xs={9}>
        <CardContent>
          <Box display='flex' justifyContent='space-between' mt={1}>
            <Typography variant='body2' color='textPrimary'>
              {/* Order ID: {allOrdersListData?.id} */}
            </Typography>
          </Box>
          <Button variant='contained' onClick={() => handleOpenDialog(allOrdersListData?._id)}>
            Cancel
          </Button>
        </CardContent>
      </Grid>
    </Grid>
  )
}

export default OrdersCard
