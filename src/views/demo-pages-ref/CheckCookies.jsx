'use client'

import { useState } from 'react'

import { useParams } from 'next/navigation'

import { useTranslation } from '@/utils/getDictionaryClient'
import { actionConfirmWithLoaderAlert, successAlert } from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'

// import { AUTHORIZATION_TOKEN_KEY_NAME, USER_ID_KEY_NAME, COOKIE_MAX_AGE_1_YEAR } from '@/utils/constants'
// import { isUserLoggedIn, setAuthorizationToken } from '@/utils/commonFunctions'

// import { isUserLoggedIn } from '@/utils/commonFunctions'

// React Imports

const CheckCookies = ({ mode }) => {
  // setAuthorizationToken('mk-token-value-here')

  // const a = Cookies.get(AUTHORIZATION_TOKEN_KEY_NAME)

  // console.log('a: ', a)

  // const isUserLoggedInStatus = isUserLoggedIn()

  // console.log('isUserLoggedInStatus: 2: ', isUserLoggedInStatus)

  const { lang: locale } = useParams()
  // const { t } = useTranslation(locale)
  // const { t: t_about } = useTranslation(locale, 'about')
  // const { t: t_privacy } = useTranslation(locale, 'privacy')

  /**
   * Delete chat user: Start
   */
  const deleteChatUserClickHandler = () => {
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data
         */
        // deleteUrl: `/v1/users/profile`,
        deleteUrl: API_ROUTER.GET_PROFILE,
        requestMethodType: 'GET',
        title: 'Are you sure you want to delete this conversation?',
        text: `This conversation will also be removed from the other participant's chat list.`,
        // action: 'Update'
        customClass: {
          confirmButton: `btn bg-error`
        }
      },
      {
        confirmButtonText: 'Confirm Delete',
        cancelButtonText: 'Cancel'
      },
      (callbackStatus, result) => {
        /**
         * swal callback
         */
        if (callbackStatus) {
          successAlert({
            title: `Conversation deleted Successfully`,
            confirmButtonText: 'Okay'
          })
        }
      }
    )
  }
  /** Delete chat user: End */

  return (
    <div className=''>
      <div className='mt-20'>Hello</div>
      {/* <div>1 --{t('page.verifyLogin.enter_your_otp')}--</div>
      <div>2 --{t_about('page.verifyLogin.enter_your_otp')}--</div>

      <div>3 --{t_about('h1')}--</div> */}
      {/* <div>4 --{t_privacy('h1')}--</div> */}
      <div onClick={deleteChatUserClickHandler}>Delete User</div>
    </div>
  )
}

export default CheckCookies
