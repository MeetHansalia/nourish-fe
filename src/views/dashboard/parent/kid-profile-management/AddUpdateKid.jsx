'use client'

// React Imports
import * as React from 'react'
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material'
import Modal from '@mui/material/Modal'

// View Imports
import Details from './Details'
import Form from './Form'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

/**
 * Page
 */
const AddUpdateKid = props => {
  // Props
  const { mode, dictionary, id } = props

  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()

  // states
  const [kidData, setKidData] = useState()
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [profileUploadedFile, setProfileUploadedFile] = useState('')

  const [openIsApproveModel, setOpenIsApproveModel] = React.useState(false)
  const handleCloseApproveModel = () => setOpenIsApproveModel(false)

  useEffect(() => {
    if (id) {
      axiosApiCall
        .get(API_ROUTER.PARENT.GET_KID_DASHBOARD(id))
        .then(response => {
          setKidData(response?.data?.response?.userData)
          setIsDataLoaded(true)

          if (response?.data?.response?.userData?.verificationStatus == 'pending') {
            setOpenIsApproveModel(true)
          }
        })
        .catch(error => {
          console.error('Error fetching roles:', error)
          setIsDataLoaded(true)
        })
    } else {
      setIsDataLoaded(true)
    }
  }, [id])

  return (
    <>
      {isDataLoaded ? (
        <>
          <Grid container spacing={6} className='profile-block'>
            <Grid item xs={12} sm={12} md={4}>
              <Details
                dictionary={dictionary}
                kidData={kidData}
                setKidData={setKidData}
                setProfileUploadedFile={setProfileUploadedFile}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <Form
                dictionary={dictionary}
                kidData={kidData}
                setKidData={setKidData}
                profileUploadedFile={profileUploadedFile}
              />
            </Grid>
          </Grid>

          <Modal
            open={openIsApproveModel}
            onClose={handleCloseApproveModel}
            aria-labelledby='modal-modal-title'
            aria-describedby='modal-modal-description'
          >
            <Box sx={style}>
              <Typography id='modal-modal-title' variant='h6' component='h2'>
                Reject Request
              </Typography>
              <Typography id='modal-modal-description' sx={{ mt: 2 }}>
                Please verify your profile details!
              </Typography>
              <Button onClick={handleCloseApproveModel}>Close</Button>
            </Box>
          </Modal>
        </>
      ) : (
        <div className='text-center'>
          <CircularProgress />
        </div>
      )}
    </>
  )
}

export default AddUpdateKid
