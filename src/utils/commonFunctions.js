// // import { cookies } from 'next/headers'
// import Cookies from 'js-cookie'

// import { AUTHORIZATION_TOKEN_KEY_NAME, USER_ID_KEY_NAME, COOKIE_MAX_AGE_1_YEAR } from '@/utils/constants'

// export const isUserLoggedIn = () => {
//   // const cookieStore = await cookies()

//   // if (cookieStore.has(AUTHORIZATION_TOKEN_KEY_NAME) && cookieStore.get(AUTHORIZATION_TOKEN_KEY_NAME)) {
//   //   return true
//   // }

//   if (Cookies.get(AUTHORIZATION_TOKEN_KEY_NAME)) {
//     return true
//   }

//   return false
// }

// export const setAuthorizationToken = async value => {
//   // const cookieStore = await cookies()

//   // cookieStore.set(AUTHORIZATION_TOKEN_KEY_NAME, value, { maxAge: COOKIE_MAX_AGE_1_YEAR })

//   Cookies.set(AUTHORIZATION_TOKEN_KEY_NAME, value, { expires: COOKIE_MAX_AGE_1_YEAR })
// }

// // export const getAuthorizationToken = () =>
// //   useCookie(AUTHORIZATION_TOKEN_KEY_NAME, { maxAge: COOKIE_MAX_AGE_1_YEAR }).value
// // export const removeAuthorizationToken = () =>
// //   (useCookie(AUTHORIZATION_TOKEN_KEY_NAME, { maxAge: COOKIE_MAX_AGE_1_YEAR }).value = null)
// // export const setAuthorizationToken = value =>
// //   (useCookie(AUTHORIZATION_TOKEN_KEY_NAME, { maxAge: COOKIE_MAX_AGE_1_YEAR }).value = value)

// // export const getUserId = () => useCookie(USER_ID_KEY_NAME, { maxAge: COOKIE_MAX_AGE_1_YEAR }).value
// // export const setUserId = value => (useCookie(USER_ID_KEY_NAME, { maxAge: COOKIE_MAX_AGE_1_YEAR }).value = value)
// // export const removeUserId = () => (useCookie(USER_ID_KEY_NAME, { maxAge: COOKIE_MAX_AGE_1_YEAR }).value = null)

// const fileDefaultExport = {
//   isUserLoggedIn
//   // getAuthorizationToken,
//   // removeAuthorizationToken,
//   // setAuthorizationToken
// }

// export default fileDefaultExport
