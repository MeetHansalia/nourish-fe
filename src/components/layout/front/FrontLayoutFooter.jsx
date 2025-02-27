// React Imports
import { useRef, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'
import { CircularProgress } from '@mui/material'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, pipe, string, minLength, email } from 'valibot'
import { isCancel } from 'axios'

// Core Component Imports
import CustomTextField from '@/@core/components/mui/TextField'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'
import { getLocalizedUrl } from '@/utils/i18n'

/**
 * Page
 */
const FrontLayoutFooter = props => {
  // Props
  const dictionary = props?.dictionary

  // Hooks
  const { lang: locale } = useParams()

  // Vars
  const contactUsUrl = getLocalizedUrl('/contact-us', locale)

  /**
   * Page form: Start
   */
  const formValidationSchema = object({
    email: pipe(
      string(),
      minLength(1, dictionary?.form?.validation?.required),
      email(dictionary?.form?.validation?.email_address)
    )
  })

  const defaultValues = {
    email: ''
  }

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset
  } = useForm({
    resolver: valibotResolver(formValidationSchema),
    defaultValues: defaultValues
  })

  const pageFormRef = useRef(null)
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)

  const onSubmit = async () => {
    setIsFormSubmitLoading(true)
    const apiFormData = new FormData(pageFormRef?.current)

    axiosApiCall
      .post(`/v1/newsletters`, apiFormData)
      .then(response => {
        setIsFormSubmitLoading(false)
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        toastSuccess(responseBody?.message)
        reset(defaultValues)
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

  return (
    <div className='footer-front' data-aos='fade-up' data-aos-easing='linear' data-aos-duration='800'>
      <div className='footer-front-subscribtion'>
        <div className='common-container'>
          <div className='footer-front-subscribtion-flex'>
            <div className='footer-front-subscribtion-flex-left'>
              <div className='common-title'>
                {/* <h2>{dictionary?.footer?.subscribe_to_updates}</h2> */}
                <h2>{dictionary?.footer?.subscribe_for_updates}</h2>
              </div>
              {/* <p>{dictionary?.footer?.healthy_meal_string}</p> */}
              <p>{dictionary?.footer?.subscribe_for_updates_cooking_string}</p>
            </div>
            <div className='footer-front-subscribtion-flex-right'>
              <form noValidate autoComplete='off' action={() => {}} onSubmit={handleSubmit(onSubmit)} ref={pageFormRef}>
                <div className='form-group'>
                  {/* <input type='email' placeholder={dictionary?.form?.placeholder?.email_placeholder}></input> */}
                  <Controller
                    name='email'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='email'
                        placeholder={dictionary?.form?.placeholder?.email_address}
                        {...(errors?.email && { error: true, helperText: errors?.email?.message })}
                      />
                    )}
                  />
                  <Button disabled={isFormSubmitLoading} className='fill-btn-common width-auto' type='submit'>
                    {dictionary?.footer?.subscribe}
                    {isFormSubmitLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
                  </Button>
                </div>
              </form>
              {/* <p>{dictionary?.footer?.terms_and_policy}</p> */}
            </div>
          </div>
        </div>
      </div>
      <div className='footer-middle'>
        <div className='common-container'>
          <div className='footer-middle-flex'>
            <div className='footer-middle-flex-left'>
              <div className='f-logo'>
                <Link href=''>
                  <img src='/images/nourishubs/front/logo.svg' alt='logo'></img>
                </Link>
              </div>
              <p>{dictionary?.page?.landing?.welcome_string}</p>
            </div>
            <div className='footer-middle-flex-right'>
              <div className='f-menu'>
                <h3>{dictionary?.footer?.quick_link}</h3>
                <ul>
                  <li>
                    <Link href={`/${locale}/about-us`}> {dictionary?.navigation?.about_us}</Link>
                  </li>
                  <li>
                    <Link href={contactUsUrl}>{dictionary?.navigation?.contact_us}</Link>
                  </li>
                  {/* <li>
                    <Link href=''>{dictionary?.footer?.privacy_policy}</Link>
                  </li> */}
                </ul>
              </div>
              <div className='f-menu social-menu'>
                <h3>{dictionary?.footer?.follow_us}</h3>
                <ul>
                  <li>
                    <Link href='https://www.facebook.com/profile.php?id=61572971040495' target='blank'>
                      <img className='social-logo' src='/images/logo/facebook.svg' alt='logo'></img>
                    </Link>
                  </li>
                  <li>
                    <Link href='https://www.instagram.com/nourishubs/' target='blank'>
                      <img className='social-logo' src='/images/logo/instagram.svg' alt='logo'></img>
                    </Link>
                  </li>
                  <li>
                    <Link href='https://youtube.com/@nourishubs' target='blank'>
                      <img className='social-logo' src='/images/logo/youtube-icon.svg' alt='icon'></img>
                    </Link>
                  </li>
                  {/* <li>
                    <Link href=''>
                      <img className='social-logo' src='/images/logo/linkedin.svg' alt='logo'></img>
                    </Link>
                  </li> */}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='footer-bottom'>
        <p>
          {dictionary?.footer?.copy_right} <Link href=''>{dictionary?.footer?.Nourishubs}</Link>
          {dictionary?.footer?.right_reserve}
        </p>
      </div>
    </div>
  )
}

export default FrontLayoutFooter
