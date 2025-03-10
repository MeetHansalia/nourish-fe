'use client'

// React Imports
import { useEffect, useState } from 'react'

// Third-party Imports
import { useSelector } from 'react-redux'
import { isCancel } from 'axios'

// MUI Imports
import { Box, CircularProgress, Grid } from '@mui/material'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { apiResponseErrorHandling, toastError } from '@/utils/globalFunctions'

// View Imports
import Details from './Details'
import EditDetails from './EditDetails'

// Redux Imports
import { profileState } from '@/redux-store/slices/profile'
import FullPageLoader from '@/components/FullPageLoader'

/**
 *
 */
const ParentProfile = ({ dictionary }) => {
  // Hooks
  const { user = null } = useSelector(profileState)

  // States
  const [userData, setUserData] = useState()
  const [isUserDataLoading, setIsUserDataLoading] = useState(true)
  const [profileUploadedFile, setProfileUploadedFile] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(null)

  useEffect(() => {
    if (user?._id) {
      axiosApiCall
        .get(API_ROUTER.PARENT.PARENT_DETAILS)
        .then(response => {
          setUserData(response?.data?.response)
          setIsUserDataLoading(false)
        })
        .catch(error => {
          if (!isCancel(error)) {
            setIsUserDataLoading(false)

            const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

            toastError(apiResponseErrorHandlingData)
          }
        })
    }
  }, [user?._id])

  return (
    <>
      {userData ? (
        <Grid container spacing={6} className='profile-block'>
          <Grid item xs={12} sm={12} md={4}>
            <Details
              dictionary={dictionary}
              userData={userData}
              setProfileUploadedFile={setProfileUploadedFile}
              setSelectedAvatar={setSelectedAvatar}
              selectedAvatar={selectedAvatar}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={8} key={selectedAvatar}>
            <EditDetails
              dictionary={dictionary}
              userData={userData}
              setUserData={setUserData}
              profileUploadedFile={profileUploadedFile}
              selectedAvatar={selectedAvatar}
            />
          </Grid>
        </Grid>
      ) : isUserDataLoading ? (
        <div className='text-center'>
          <FullPageLoader open={true} color='primary' spinnerSize={60} />
        </div>
      ) : (
        <div className='text-center'>No Data</div>
      )}
    </>
  )
}

export default ParentProfile
