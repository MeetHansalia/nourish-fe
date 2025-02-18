'use client'

// React Imports
import { useState, useRef } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import FormControl from '@mui/material/FormControl'
import { IconButton, InputAdornment } from '@mui/material'

// Third-party Imports
import { getSession, signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
// import { valibotResolver } from '@hookform/resolvers/valibot'
// import * as valibot from 'valibot'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import classnames from 'classnames'
import { isCancel } from 'axios'

// Core Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import NourishubsLogo from '@/components/nourishubs/NourishubsLogo'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import axiosApiCall from '@utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'
import {
  apiResponseErrorHandling,
  fetchUserProfileAndUpdateStoreValue,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'
import { DEFAULT_ERROR_MESSAGE, USER_ROLE_TO_PANEL_MAPPING } from '@/utils/constants'
import { API_ROUTER } from '@/utils/apiRoutes'

// Styled Custom Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

/**
 * Page
 */
const Login = ({ mode, dictionary }) => {
  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  /**
   * Page form: Start
   */
  // const formValidationSchema = valibot.object({
  //   email: valibot.pipe(
  //     valibot.string(),
  //     valibot.nonEmpty(dictionary?.form?.validation?.required),
  //     valibot.email(dictionary?.form?.validation?.email_address)
  //   ),
  //   isAgreePrivacyAndTerms: valibot.pipe(
  //     valibot.boolean(),
  //     valibot.value(true, dictionary?.form?.validation?.agree_privacy_policy)
  //   )
  // })

  const formValidationSchema = yup.object({
    email: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .email(dictionary?.form?.validation?.email_address),
    password: yup.string().when('login_type', {
      is: 'password',
      then: () => yup.string().required(dictionary?.form?.validation?.required)
    }),
    isAgreePrivacyAndTerms: yup.boolean().oneOf([true], dictionary?.form?.validation?.agree_privacy_policy),
    login_type: yup.string().required().oneOf(['password', 'otp'])
  })

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    // resolver: valibotResolver(formValidationSchema),
    resolver: yupResolver(formValidationSchema),
    defaultValues: {
      email: '',
      password: '',
      isAgreePrivacyAndTerms: false,
      login_type: 'password' // otp|password
    }
  })

  const pageFormRef = useRef(null)
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(null)

  const onSubmit = async values => {
    if (loginType === 'otp') {
      onSubmitLoginWithOTP(values)
    } else if (loginType === 'password') {
      onSubmitLoginWithPassword(values)
    }
  }

  const onSubmitLoginWithOTP = values => {
    setIsFormSubmitLoading(true)

    const apiFormData = new FormData(pageFormRef?.current)

    try {
      apiFormData?.delete('isAgreePrivacyAndTerms')
    } catch (error) {}

    // console.log(Object?.fromEntries(apiFormData?.entries()))

    axiosApiCall
      .post(API_ROUTER.AUTH.LOGIN, apiFormData)
      .then(response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        if (responseBodyData?.otp) {
          console.log('OTP: ', responseBodyData?.otp)
        }

        toastSuccess(responseBody?.message)

        const queryParams = Object?.fromEntries(searchParams?.entries())
        const queryString = new URLSearchParams({ ...values, ...queryParams }).toString()
        const pathname = getLocalizedUrl('/verify-login', locale)
        const redirectURL = `${pathname}?${queryString}`

        // console.log('queryParams: ', queryParams)
        // console.log('queryString: ', queryString)
        // console.log('pathname: ', pathname)
        // console.log('redirectURL: ', redirectURL)

        router.push(redirectURL)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsFormSubmitLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            setFormFieldsErrors(apiResponseErrorHandlingData, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
          }
        }
      })
  }

  const onSubmitLoginWithPassword = async values => {
    setIsFormSubmitLoading(true)

    const res = await signIn('credentials', {
      email: values?.email,
      password: values?.password,
      redirect: false
    })

    if (res && res?.ok && res?.error === null) {
      const session = await getSession()
      const userRole = session?.user?.role || ''
      const userPanel = USER_ROLE_TO_PANEL_MAPPING[userRole] || ''
      const redirectURL = searchParams.get('redirectTo') ?? (`/${userPanel}` || '/')

      await fetchUserProfileAndUpdateStoreValue()

      router.replace(getLocalizedUrl(redirectURL, locale))
    } else {
      setIsFormSubmitLoading(false)

      if (res?.error) {
        const error = JSON.parse(res?.error)

        if (error?.response?.userData?.isEmailVerified === false) {
          const queryParams = Object?.fromEntries(searchParams?.entries())
          const queryString = new URLSearchParams({ ...values, ...queryParams }).toString()
          const pathname = getLocalizedUrl('/verify-login', locale)

          const redirectURL = `${pathname}?${queryString}`

          router.push(redirectURL)

          return
        }

        const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

        if (isVariableAnObject(apiResponseErrorHandlingData)) {
          setFormFieldsErrors(apiResponseErrorHandlingData, setError)
        } else {
          toastError(apiResponseErrorHandlingData)
        }
      } else {
        toastError(DEFAULT_ERROR_MESSAGE)
      }
    }
  }

  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  /** Page form: End */

  /**
   * Toggle login type: Start
   */
  const loginType = watch('login_type')

  const toggleLoginType = () => {
    setValue('login_type', loginType === 'password' ? 'otp' : 'password')
  }
  /** Toggle login type: End */

  /**
   * Page Life Cycle: Start
   */
  // useEffect(() => {
  //   return () => {
  //     //
  //   }
  // }, [])
  /** Page Life Cycle: End */

  return (
    <div className='flex bs-full justify-center login-main'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative login-main-left p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <LoginIllustration src={'/images/nourishubs/front/man-with-laptop.png'} alt='character-illustration' />
        {!hidden && <MaskImg alt='mask' src={authBackground} />}
      </div>

      <div className='login-auth-block-main flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[700px]'>
        <div className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Link href={getLocalizedUrl('/', locale)}>
            {/* <Logo /> */}
            <NourishubsLogo />
          </Link>
        </div>

        <div className='login-auth-block flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0'>
          <div className='login-auth-block-title flex flex-col gap-1'>
            <Typography variant='h4' className='text-primary'>
              {dictionary?.common?.welcome}
            </Typography>
            <Typography>{dictionary?.page?.login?.login_to_your_account}</Typography>
          </div>

          <form
            noValidate
            autoComplete='off'
            action={() => {}}
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col gap-6 login-auth-form'
            ref={pageFormRef}
          >
            <Controller
              name='email'
              className='login-auth-form-input'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  autoFocus
                  fullWidth
                  className='login-auth-form-input'
                  type='email'
                  label={dictionary?.form?.label?.email_address}
                  placeholder={dictionary?.form?.placeholder?.email_address}
                  {...(errors?.email && { error: true, helperText: errors?.email?.message })}
                />
              )}
            />

            {loginType === 'password' && (
              <Controller
                name='password'
                className='login-auth-form-input'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    className='login-auth-form-input'
                    type={isPasswordShown ? 'text' : 'password'}
                    label={dictionary?.form?.label?.password}
                    placeholder={dictionary?.form?.placeholder?.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment className='icon-eye-password' position='end'>
                          <IconButton
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <i className={isPasswordShown ? 'tabler-eye' : 'tabler-eye-off'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    {...(errors.password && { error: true, helperText: errors.password.message })}
                  />
                )}
              />
            )}

            <div className='forgot-link-block flex justify-end'>
              <Typography
                className='text-end'
                color='primary'
                component={Link}
                href={getLocalizedUrl('/forgot-password', locale)}
              >
                {dictionary?.navigation?.forgot_password}?
              </Typography>
            </div>

            <FormControl className='checkbox-input-block' error={Boolean(errors.isAgreePrivacyAndTerms)}>
              <Controller
                name='isAgreePrivacyAndTerms'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} />}
                    label={dictionary?.form?.label?.agree_privacy_policy}
                  />
                )}
              />
              {errors.isAgreePrivacyAndTerms && (
                <FormHelperText error>{errors?.isAgreePrivacyAndTerms?.message}</FormHelperText>
              )}
              {errors.login_type && <FormHelperText error>{errors?.login_type?.message}</FormHelperText>}
            </FormControl>

            <Button
              className='custom-login-btn'
              disabled={isFormSubmitLoading}
              fullWidth
              variant='contained'
              type='submit'
            >
              {loginType === 'otp' ? dictionary?.page?.login?.send_otp : dictionary?.common?.login}{' '}
              {isFormSubmitLoading && <CircularProgress className='ml-1' size={20} sx={{ color: 'white' }} />}
            </Button>

            <div className='last-link-block flex justify-center items-center flex-wrap gap-2'>
              {loginType === 'otp' && (
                <Typography className='email-text-otp'>{dictionary?.page?.login?.we_will_send_otp_string}</Typography>
              )}
              <Typography color='primary' className='cursor-pointer' onClick={toggleLoginType}>
                {loginType === 'otp'
                  ? dictionary?.page?.login?.login_with_password
                  : dictionary?.page?.login?.login_with_otp}
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
