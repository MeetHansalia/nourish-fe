import React from 'react'

import { Typography } from '@mui/material'

const getStatusColor = status => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return 'primary.main' // dark green
    case 'approved':
      return 'primary.main'
    case 'rejected':
      return 'error.main' // red
    case 'reject':
      return 'error.main' // red
    case 'accepted':
      return 'success.main' // light green
    case 'cancelled':
      return 'warning.main' // oreange
    case 'pending':
      return '#FFC107' // yellowish
    case 'suspended':
      return ''
    case 'deleted':
      return 'error.main'
    case 'active':
      return 'primary.main'
    case 'initiate':
      return '#FFC107'
    default:
      return 'text.primary' // theme green
  }
}

const StatusLabel = ({ status }) => {
  return (
    <Typography
      sx={{
        minWidth: 90,
        fontWeight: 'bold',
        textTransform: 'capitalize',
        color: getStatusColor(status)
      }}
    >
      {status}
    </Typography>
  )
}

export default StatusLabel
