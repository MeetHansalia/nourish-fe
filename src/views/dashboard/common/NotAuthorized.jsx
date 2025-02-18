'use client'

// Next Imports

// MUI Imports
import Typography from '@mui/material/Typography'

const NotAuthorized = ({ mode }) => {
  // Vars

  return (
    <div className='flex items-center justify-center min-bs-[100dvh] relative p-6 overflow-x-hidden'>
      <div className='flex items-center flex-col text-center'>
        <div className='flex flex-col gap-2 is-[90vw] sm:is-[unset]'>
          <Typography variant='h4'>You are not authorized! 🔐</Typography>
          <Typography>You don&#39;t have permission to access this page.</Typography>
        </div>
        <img
          alt='error-401-illustration'
          src='/images/illustrations/characters/3.png'
          className='object-cover bs-[400px] md:bs-[450px] lg:bs-[500px] mbs-10'
        />
      </div>
    </div>
  )
}

export default NotAuthorized
