'use client'

// React Imports
import { useState, useRef, useEffect } from 'react'

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
import FormHelperText from '@mui/material/FormHelperText'

// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import classnames from 'classnames'
import { isCancel } from 'axios'
import { OTPInput } from 'input-otp'

// Component Imports
import { FormControlLabel, FormLabel, IconButton, InputAdornment } from '@mui/material'

import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'
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
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess,
  fetchUserProfileAndUpdateStoreValue
} from '@/utils/globalFunctions'

// Style Imports
import styles from '@/libs/styles/inputOtp.module.css'

// Server Actions
import { navigate } from '@/app/server/actions'
import { API_ROUTER } from '@/utils/apiRoutes'

// Page Level Custom Components
const Slot = props => {
  return (
    <div className={classnames(styles.slot, { [styles.slotActive]: props.isActive })}>
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  )
}

const FakeCaret = () => {
  return (
    <div className={styles.fakeCaret}>
      <div className='w-px h-5 bg-textPrimary' />
    </div>
  )
}

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
const VerifyLogin = ({ mode, dictionary }) => {
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
  const formValidationSchema = yup.object({
    otp: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .min(6, dictionary?.form?.validation?.exactly_6_digits),
    newPassword: yup.string().required(dictionary?.form?.validation?.required),
    confirm_password: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .oneOf([yup.ref('newPassword'), null], dictionary?.form?.validation?.passwords_must_match)
  })

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(formValidationSchema),
    defaultValues: {
      otp: '',
      newPassword: '',
      confirm_password: ''
    }
  })

  const pageFormRef = useRef(null)
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(null)

  const queryParams = Object?.fromEntries(searchParams?.entries())

  const onSubmit = async values => {
    setIsFormSubmitLoading(true)

    const apiFormData = {
      email: queryParams?.email || '',
      otp: Number(values?.otp) || '',
      newPassword: values?.newPassword
    }

    axiosApiCall
      .post(API_ROUTER.AUTH.RESET_PASSWORD, apiFormData)
      .then(response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        toastSuccess(responseBody?.message)

        router.push(getLocalizedUrl('/login', locale))
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

  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)
  /** Page form: End */

  /**
   * OTP handling: Start
   */
  const isOtpInserted = useRef(false)

  const onOtpComplete = () => {
    //
  }
  /** OTP handling: End */

  /**
   * Resend OTP: Start
   */
  const [isResendOtpLoading, setIsResendOtpLoading] = useState(false)
  const resendOtpController = useRef()

  const resendOtpHandler = () => {
    if (isResendOtpLoading) {
      return
    }

    if (resendOtpTimer) {
      return
    }

    setIsResendOtpLoading(true)

    const apiFormData = {
      email: queryParams?.email || ''
    }

    if (resendOtpController.current) {
      resendOtpController.current?.abort()
    }

    resendOtpController.current = new AbortController()

    axiosApiCall
      .post(API_ROUTER.AUTH.RESEND_OTP, apiFormData, {
        signal: resendOtpController.current?.signal
      })
      .then(response => {
        const responseBody = response.data
        const responseBodyData = responseBody.response

        setIsResendOtpLoading(false)

        toastSuccess(responseBody?.message)
        resendOtpStartTimer()
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsResendOtpLoading(false)

          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }

  const resendOtpTimerSeconds = 30
  const resendOtpTimerRef = useRef(resendOtpTimerSeconds)
  const [resendOtpTimer, setResendOtpTimer] = useState(resendOtpTimerSeconds)
  const resendOtpIntervalId = useRef(null)

  const resendOtpStartTimer = () => {
    if (resendOtpIntervalId.current) {
      clearInterval(resendOtpIntervalId.current)
      resendOtpIntervalId.current = null
    }

    resendOtpTimerRef.current = resendOtpTimerSeconds
    setResendOtpTimer(resendOtpTimerRef.current)
    resendOtpIntervalId.current = setInterval(() => {
      if (resendOtpTimerRef.current > 0) {
        resendOtpTimerRef.current--
        setResendOtpTimer(resendOtpTimerRef.current)
      } else {
        resendOtpTimerRef.current = null
        setResendOtpTimer(resendOtpTimerRef.current)

        if (resendOtpIntervalId.current) {
          clearInterval(resendOtpIntervalId.current)
          resendOtpIntervalId.current = null
        }
      }
    }, 1000)
  }
  /** Resend OTP: End */

  /**
   * Page Life Cycle: Start
   */
  useEffect(() => {
    resendOtpStartTimer()

    return () => {
      try {
        if (resendOtpIntervalId.current) {
          clearInterval(resendOtpIntervalId.current)
          resendOtpIntervalId.current = null
        }
      } catch (error) {}

      try {
        if (resendOtpController.current) {
          resendOtpController.current?.abort()
        }
      } catch (error) {}
    }
  }, [])
  /** Page Life Cycle: End */

  return (
    <div className='flex bs-full justify-center login-main'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
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
              {dictionary?.navigation?.forgot_password}
            </Typography>
            <Typography>{dictionary?.page?.verifyLogin?.enter_your_otp}</Typography>
          </div>

          <form
            noValidate
            autoComplete='off'
            action={() => {}}
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col gap-6 login-auth-form'
            ref={pageFormRef}
          >
            <div className='login-auth-form-input'>
              <FormLabel>{dictionary?.form?.label?.otp_field}</FormLabel>
              <Controller
                name='otp'
                control={control}
                render={({ field }) => (
                  <OTPInput
                    {...field}
                    autoFocus
                    onComplete={onOtpComplete}
                    maxLength={6}
                    containerClassName='flex items-center'
                    render={({ slots }) => (
                      <div className='flex items-center justify-between w-full gap-4'>
                        {slots.slice(0, 6).map((slot, idx) => (
                          <Slot key={idx} {...slot} />
                        ))}
                      </div>
                    )}
                  />
                )}
              />
              {errors?.otp?.message && <FormHelperText error>{errors?.otp?.message}</FormHelperText>}
              {errors?.email?.message && <FormHelperText error>{errors?.email?.message}</FormHelperText>}
            </div>
            {/* <div className='otp-text-block flex justify-center items-center flex-wrap gap-2'>
              {resendOtpTimer > 0 && <Typography>{resendOtpTimer}s</Typography>}
              <Typography
                className='cursor-pointer resend-block-color flex justify-end items-end'
                color={resendOtpTimer > 0 || isResendOtpLoading ? 'secondary' : 'primary'}
                onClick={resendOtpHandler}
              >
                {dictionary?.page?.verifyLogin?.resend}{' '}
                {isResendOtpLoading && <CircularProgress size={10} sx={{ color: 'primary' }} />}
              </Typography>
            </div> */}

            <div className='otp-text-block flex justify-between w-full'>
              <span className='text-left'>{resendOtpTimer > 0 && <Typography>{resendOtpTimer}s</Typography>}</span>
              <span className='text-right'>
                <Typography
                  className={`cursor-pointer resend-block-color flex justify-end items-center ${resendOtpTimer > 0 || isResendOtpLoading ? 'pointer-events-none opacity-50' : ''}`}
                  color={resendOtpTimer > 0 || isResendOtpLoading ? 'secondary' : 'primary'}
                  onClick={resendOtpHandler}
                >
                  {dictionary?.page?.verifyLogin?.resend}{' '}
                  {isResendOtpLoading && <CircularProgress className='ml-1' size={10} sx={{ color: 'primary' }} />}
                </Typography>
              </span>
            </div>

            <Controller
              name='newPassword'
              control={control}
              className='login-auth-form-input'
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  className='login-auth-form-input'
                  type={isPasswordShown ? 'text' : 'password'}
                  label={dictionary?.form?.label?.new_password}
                  placeholder={dictionary?.form?.placeholder?.new_password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment className='icon-eye-password' position='end'>
                        <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                          <i className={isPasswordShown ? 'tabler-eye' : 'tabler-eye-off'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  {...(errors.newPassword && { error: true, helperText: errors.newPassword.message })}
                />
              )}
            />

            <Controller
              name='confirm_password'
              control={control}
              className='login-auth-form-input'
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  className='login-auth-form-input'
                  type={isConfirmPasswordShown ? 'text' : 'password'}
                  label={dictionary?.form?.label?.confirm_new_password}
                  placeholder={dictionary?.form?.placeholder?.confirm_new_password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment className='icon-eye-password' position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleClickShowConfirmPassword}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isConfirmPasswordShown ? 'tabler-eye' : 'tabler-eye-off'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  {...(errors.confirm_password && { error: true, helperText: errors.confirm_password.message })}
                />
              )}
            />

            <Button
              className='custom-login-btn'
              disabled={isFormSubmitLoading}
              fullWidth
              variant='contained'
              type='submit'
            >
              {dictionary?.form?.button?.confirm}{' '}
              {isFormSubmitLoading && <CircularProgress className='ml-1' size={20} sx={{ color: 'white' }} />}
            </Button>

            {/* {JSON.stringify(errors)} */}
          </form>
        </div>
      </div>
    </div>
  )
}

export default VerifyLogin
