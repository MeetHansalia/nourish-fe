'use client'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

/**
 * Page
 */
const SignUp = ({ mode, dictionary }) => {
  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()

  // Vars
  const vendorSignUpUrl = getLocalizedUrl('/signup/vendor', locale)
  const parentSignUpUrl = getLocalizedUrl('/signup/parent', locale)
  const schoolSignUpUrl = getLocalizedUrl('/signup/school', locale)

  return (
    <div className=''>
      <div className='inner-banner'>
        <div className='common-container'>
          <div className='inner-banner-flex'>
            <div className='inner-banner-left'>
              <h1>{dictionary?.page?.signUp?.join_string}</h1>
              <p>{dictionary?.page?.signUp?.sign_up_string}</p>
            </div>
            <div className='inner-banner-right'>
              <img src='/images/nourishubs/front/inner-banner.png' alt='banner'></img>
            </div>
          </div>
        </div>
      </div>
      <div className='select-role-block'>
        <div className='common-container'>
          <div className='common-title'>
            <h2>
              {dictionary?.page?.signUp?.select_string}
              <br></br> {dictionary?.page?.signUp?.community_string}
            </h2>
          </div>
          <div className='sign-up-link'>
            <div className='sign-up-link-inner'>
              <div className='common-bg-box'>
                <h2>{dictionary?.page?.signUp?.simple_string}</h2>
                <p>{dictionary?.page?.signUp?.option_string}</p>
                <Link href={schoolSignUpUrl}>
                  {dictionary?.common?.sign_up}
                  <img src='/images/nourishubs/front/arrow-icon.png' alt='arrow-icon'></img>
                </Link>
              </div>
            </div>
            <div className='sign-up-link-inner'>
              <div className='common-bg-box'>
                <h2>{dictionary?.page?.signUp?.meal_string}</h2>
                <p>{dictionary?.page?.signUp?.order_string}</p>
                <Link href={parentSignUpUrl}>
                  {dictionary?.common?.sign_up}
                  <img src='/images/nourishubs/front/arrow-icon.png' alt='arrow-icon'></img>
                </Link>
              </div>
            </div>
            <div className='sign-up-link-inner'>
              <div className='common-bg-box'>
                <h2>{dictionary?.page?.signUp?.catering_string}</h2>
                <p>{dictionary?.page?.signUp?.nutritious_string}</p>
                <Link href={vendorSignUpUrl}>
                  {dictionary?.common?.sign_up}
                  <img src='/images/nourishubs/front/arrow-icon.png' alt='arrow-icon'></img>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className='banner-main'>
        <div className='banner-main-img'>
          <img src='/images/nourishubs/front/banner-img.jpg' alt='banner'></img>
        </div>
        <div className='banner-text'>
          <div className='common-container'>
            <h1>SignUp Page: Nourishing the Future</h1>
          </div>
        </div>
      </div>
      <div className='about-sign-up'>
        <div className='common-container'>
          <div className='about-sign-up-flex'>
            <div className='about-sign-up-left'>
              <h2>
                Nourishing<br></br> Connections : Schools, Parents & Caterers
              </h2>
            </div>
            <div className='about-sign-up-right'>
              <div className='common-bg-box about-sign-up-right-inner'>
                <p>
                  Welcome to Nourishubs, where we offer healthy options for school meals. Join us in promoting
                  nutritious meals for students and making healthy eating accessible for families.
                </p>
                <Button className='fill-btn-common width-auto'>Sign Up</Button>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  )
}

export default SignUp
