'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'

// Third-party Imports
import { useSelector, useDispatch } from 'react-redux'

// Redux Imports
import { setProfile, resetProfile, profileState } from '@/redux-store/slices/profile'

// Util Imports
import axiosApiCall from '@utils/axiosApiCall'
import { fetchLoggedInUserProfile, fetchUserProfileAndUpdateStoreValue } from '@utils/globalFunctions'

/**
 * Page
 */
const About = ({ mode }) => {
  /**
   * Profile Redux Store: Start
   */
  // const dispatch = useDispatch()
  // const { user = null } = useSelector(profileState)

  // const profileUpdateClickHandler = () => {
  //   // console.log('in profileUpdateClickHandler')

  //   const updatedUser = {
  //     name: 'MK'
  //   }

  //   dispatch(setProfile(updatedUser))
  // }

  // const profileResetClickHandler = () => {
  //   // console.log('in profileResetClickHandler')

  //   dispatch(resetProfile())
  // }
  /** Profile Redux Store: End */

  /**
   * Axios Test: Start
   */
  // const makeApiCall = () => {
  //   axiosApiCall
  //     .get(`/v1/users?page=1&limit=10`)
  //     .then(response => {
  //       const responseBody = response?.data
  //       const responseBodyData = responseBody?.response

  //       // console.log('responseBodyData: ', responseBodyData)
  //     })
  //     .catch(error => {
  //       //
  //     })
  // }
  /** Axios Test: End */

  /**
   * Fetch user profile: Start
   */
  // const fetchUserProfile = async () => {
  //   // const user = await fetchLoggedInUserProfile()
  //   // console.log('user: ', user)
  //   // const profileData = await fetchUserProfileAndUpdateStoreValue()
  //   // console.log('profileData: ', profileData)
  // }
  /** Fetch user profile: End */

  /**
   * Page Life Cycle: Start
   */
  // useEffect(() => {
  //   // console.log('about here')
  //   // makeApiCall()
  //   // fetchUserProfile()
  // }, [])
  /** Page Life Cycle: End */

  return (
    <div>
      {/* <div>About here</div> */}
      {/* <Button variant='contained' onClick={profileUpdateClickHandler}>
        Update Profile Data
      </Button>
      <Button variant='contained' onClick={profileResetClickHandler}>
        Reset Profile Data
      </Button>
      {JSON.stringify(user)} */}
    </div>
  )
}

export default About
