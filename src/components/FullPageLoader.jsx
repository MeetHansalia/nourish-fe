import React from 'react'

import { CircularProgress } from '@mui/material'

const FullPageLoader = ({ open, color = 'primary', spinnerSize = 40, backdropColor = '#ffffff' }) => {
  if (!open) return null

  return (
    <div
      className='full-page-loader'
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: backdropColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9
      }}
    >
      <CircularProgress color={color} size={spinnerSize} />
    </div>
  )
}

export default FullPageLoader
