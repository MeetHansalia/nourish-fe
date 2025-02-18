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
import { signIn } from 'next-auth/react'
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
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'
import { DEFAULT_ERROR_MESSAGE } from '@/utils/constants'
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
  const formValidationSchema = yup.object({
    email: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .email(dictionary?.form?.validation?.email_address)
  })

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(formValidationSchema),
    defaultValues: {
      email: ''
    }
  })

  const pageFormRef = useRef(null)
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(null)

  const onSubmit = async values => {
    setIsFormSubmitLoading(true)

    const apiFormData = new FormData(pageFormRef?.current)

    axiosApiCall
      .post(API_ROUTER.AUTH.FORGET_PASSWORD, apiFormData)
      .then(response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        if (responseBodyData?.otp) {
          console.log('OTP: ', responseBodyData?.otp)
        }

        toastSuccess(responseBody?.message)

        const queryString = new URLSearchParams({ ...values }).toString()
        const pathname = getLocalizedUrl('/reset-password', locale)
        const redirectURL = `${pathname}?${queryString}`

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
  /** Page form: End */

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

        <div className='login-auth-block  flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0'>
          <div className='login-auth-block-title flex flex-col gap-1'>
            <Typography variant='h4' className='text-primary'>
              {dictionary?.navigation?.forgot_password}
            </Typography>
            <Typography>{dictionary?.page?.forgotPassword?.reset_your_password}</Typography>
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
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  autoFocus
                  className='login-auth-form-input'
                  fullWidth
                  type='email'
                  label={dictionary?.form?.label?.email_address}
                  placeholder={dictionary?.form?.placeholder?.email_address}
                  {...(errors?.email && { error: true, helperText: errors?.email?.message })}
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
              {dictionary?.page?.forgotPassword?.send}{' '}
              {isFormSubmitLoading && <CircularProgress className='ml-1' size={20} sx={{ color: 'white' }} />}
            </Button>

            <div className='last-link-block flex justify-center items-center flex-wrap gap-2'>
              <Link href={`/${locale}/login`}>
                <Typography color='primary' className='cursor-pointer'>
                  {dictionary?.page?.forgotPassword?.go_to_login}
                </Typography>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
