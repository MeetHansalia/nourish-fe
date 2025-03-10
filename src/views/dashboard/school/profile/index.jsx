'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { Box, CircularProgress, Grid } from '@mui/material'

// Redux Imports
// import { useSelector } from 'react-redux'

// Third-party Imports
import { isCancel } from 'axios'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { apiResponseErrorHandling, toastError } from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'

// View Imports
import Details from './Details'
import EditDetails from './EditDetails'
import UploadDocument from './UploadDocument'
import ProfileViewDialog from './ProfileViewDialogBox'
// import MinimumThreshold from './MinimumThreshold'

// Component imports
import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'

/**
 * Page
 */
const ProfileManagement = ({ dictionary }) => {
  // Hooks
  // const { user = null } = useSelector(state => state?.profileReducer)

  // states
  const [userData, setUserData] = useState()
  const [isUserDataLoading, setIsUserDataLoading] = useState(true)
  const [selectedAvatar, setSelectedAvatar] = useState(null)

  useEffect(() => {
    axiosApiCall
      .get(API_ROUTER.GET_PROFILE)
      .then(response => {
        setUserData(response?.data?.response?.user)
        setIsUserDataLoading(false)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsUserDataLoading(false)

          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }, [])

  return (
    <>
      {userData ? (
        <Grid container spacing={6}>
          <Grid item xs={12} sm={12} md={4} lg={4}>
            <Details
              dictionary={dictionary}
              userData={userData}
              setSelectedAvatar={setSelectedAvatar}
              selectedAvatar={selectedAvatar}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={8} lg={8} key={selectedAvatar}>
            <EditDetails
              dictionary={dictionary}
              userData={userData}
              setUserData={setUserData}
              selectedAvatar={selectedAvatar}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <UploadDocument dictionary={dictionary} userData={userData} />
          </Grid>
        </Grid>
      ) : isUserDataLoading ? (
        <div className='text-center'>
          <CircularProgress />
        </div>
      ) : (
        <div className='text-center'>No Data</div>
      )}

      <OpenDialogOnElementClick
        elementProps={{
          variant: 'outlined',
          color: 'primary'
        }}
        dialogProps={{ dictionary }}
        dialog={ProfileViewDialog}
      />
    </>
  )
}

export default ProfileManagement
