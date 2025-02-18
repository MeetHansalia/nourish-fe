'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Button, Card, CardHeader, Grid, Typography } from '@mui/material'

const PaymentMethod = ({ dictionary }) => {
  // states
  const [userData, setUserData] = useState([])

  return (
    <Card style={{ marginTop: '20px' }}>
      <CardHeader
        title={dictionary?.page?.common?.payment_method}
        action={
          <Button variant='contained' sx={{ m: 1 }} type='submit'>
            {dictionary?.form?.button?.add_bank_account}
          </Button>
        }
        sx={{ '& .MuiCardHeader-action': { alignSelf: 'center' } }}
      />
      <Grid container spacing={2} sx={{ pl: 2 }}>
        <Grid item xs={12}>
          <Typography>{dictionary?.page?.common?.account_number + ' : 2144444444'}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>{dictionary?.page?.common?.ifs_code + ' : 123'}</Typography>
        </Grid>
      </Grid>
    </Card>
  )
}

export default PaymentMethod
