'use client'

// Next Imports
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Button from '@mui/material/Button'

// Third-party Imports
import { Trans } from 'react-i18next'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { useTranslation } from '@/utils/getDictionaryClient'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Views Imports
import TestimonialsSection from '@views/front/landing/TestimonialsSection'

/**
 * Page
 */
const LandingPageWrapper = ({ mode, dictionary }) => {
  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()

  // Vars
  const signUpUrl = getLocalizedUrl('/signup', locale)
  const { t } = useTranslation(locale)

  /**
   * General function: Start
   */
  const handleOnClick = () => {
    router.push(getLocalizedUrl(signUpUrl, locale))
  }
  /** General function: End */

  return (
    <div className=''>
      <div className='banner-main'>
        <div className='banner-main-img'>
          <img src='/images/nourishubs/front/banner-img-3.jpg' alt='banner' className='desktop-banner-img'></img>
          <img src='/images/nourishubs/front/banner-img-mobile.svg' alt='banner' className='mobile-banner-img'></img>
        </div>
        <div className='banner-text'>
          <div className='common-container'>
            {/* <h1>{dictionary?.page?.landing?.nourishing_the_future}</h1> */}
            {/* --{t('page.verifyLogin.enter_your_otp')}-- */}
          </div>
        </div>
      </div>
      <div className='about-sign-up'>
        <div className='common-container'>
          <div className='about-sign-up-flex' data-aos='fade-up'>
            <div className='about-sign-up-left'>
              {/* <h2>
                {dictionary?.page?.landing?.nourishing}
                <br></br> {dictionary?.page?.landing?.nourishing_connection}
              </h2> */}
              <h2 className='uppercase'>{dictionary?.page?.landing?.building_healthy_community_string}</h2>
            </div>
            <div className='about-sign-up-right'>
              <div className='common-bg-box about-sign-up-right-inner'>
                {/* <p>{dictionary?.page?.landing?.welcome_string}</p> */}
                <p>
                  {/* <Trans
                    i18nKey='page.landing.welcome_coming_soon_string'
                    values={{ app_name: themeConfig.templateName }}
                  ></Trans> */}
                  <Trans i18nKey='page.landing.get_ready_surprise_coming_string'></Trans>
                </p>
                {/* <Button onClick={handleOnClick} className='fill-btn-common width-auto'>
                  {dictionary?.common?.sign_up}
                </Button> */}
                {/* <Link href={`/${locale}/signup`} className='fill-btn-common width-auto'>
                  {dictionary?.common?.sign_up}
                </Link> */}
                <Link href={`/${locale}/contact-us`} className='fill-btn-common width-auto uppercase'>
                  {dictionary?.common?.get_in_touch}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='discover-block'>
        <div className='discover-block-shape-top' data-aos='fade-up' data-aos-easing='linear' data-aos-duration='800'>
          <img src='/images/nourishubs/front/shape-img.png' alt='shape-img'></img>
        </div>
        <div
          className='discover-block-shape-bottom'
          data-aos='fade-up'
          data-aos-easing='linear'
          data-aos-duration='800'
        >
          <img src='/images/nourishubs/front/shape-img-2.png' alt='shape-img'></img>
        </div>
        <div className='common-container'>
          <div className='discover-block-inner'>
            <div className='common-title' data-aos='fade-up' data-aos-duration='1000'>
              {/* <h2>{dictionary?.page?.landing?.discover_string}</h2> */}
              <h2>{dictionary?.page?.landing?.healthy_eating_made_simple}</h2>
            </div>
            {/* <div className='discover-block-three'>
              <div className='discover-block-three-inner'>
                <div className='common-bg-box'>
                  <div className='img-category'>
                    <img src='/images/nourishubs/front/category-img.png' alt='category-img'></img>
                  </div>
                  <div className='catagory-text'>
                    <h4>{dictionary?.page?.landing?.community_string}</h4>
                    <p>{dictionary?.page?.landing?.sign_up_string}</p>
                    <Link href={signUpUrl}>
                      {dictionary?.common.sign_up}
                      <img src='/images/nourishubs/front/arrow-icon.png' alt='arrow-icon'></img>
                    </Link>
                  </div>
                </div>
              </div>
              <div className='discover-block-three-inner'>
                <div className='common-bg-box'>
                  <div className='img-category'>
                    <img src='/images/nourishubs/front/category-img.png' alt='category-img'></img>
                  </div>
                  <div className='catagory-text'>
                    <h4> {dictionary?.page?.landing?.collaborate_string}</h4>
                    <p> {dictionary?.page?.landing?.school_vendor_string}</p>
                    <Link href={signUpUrl}>
                      {dictionary?.common?.join}
                      <img src='/images/nourishubs/front/arrow-icon.png' alt='arrow-icon'></img>
                    </Link>
                  </div>
                </div>
              </div>
              <div className='discover-block-three-inner'>
                <div className='common-bg-box'>
                  <div className='img-category'>
                    <img src='/images/nourishubs/front/category-img.png' alt='category-img'></img>
                  </div>
                  <div className='catagory-text'>
                    <h4> {dictionary?.page?.landing?.notification_string} </h4>
                    <p>{dictionary?.page?.landing?.register_string} </p>
                    <Link href={signUpUrl}>
                      {dictionary?.common?.get_started}
                      <img src='/images/nourishubs/front/arrow-icon.png' alt='arrow-icon'></img>
                    </Link>
                  </div>
                </div>
              </div>
            </div> */}
            <div className='discover-block-inner-four'>
              <div
                data-aos='fade-up'
                data-aos-easing='linear'
                data-aos-duration='500'
                className='discover-block-inner-four-inner'
              >
                <div className='common-bg-box'>
                  <img src='/images/nourishubs/front/helthy-img-en.svg' alt='helthy-img' className='en-img'></img>
                  <img src='/images/nourishubs/front/helthy-img-th.svg' alt='helthy-img' className='th-img'></img>
                  <img src='/images/nourishubs/front/helthy-img-vi.svg' alt='helthy-img' className='vi-img'></img>
                  <img src='/images/nourishubs/front/helthy-img-fil.svg' alt='helthy-img' className='fil-img'></img>
                  <img src='/images/nourishubs/front/helthy-img-id.svg' alt='helthy-img' className='id-img'></img>
                  {/* <span>1</span> */}
                </div>
              </div>
              <div
                data-aos='fade-up'
                data-aos-easing='linear'
                data-aos-duration='600'
                className='discover-block-inner-four-inner'
              >
                <div className='common-bg-box'>
                  <img src='/images/nourishubs/front/helthy-img-en-2.svg' alt='helthy-img' className='en-img'></img>
                  <img src='/images/nourishubs/front/helthy-img-th-2.svg' alt='helthy-img' className='th-img'></img>
                  <img src='/images/nourishubs/front/helthy-img-vi-2.svg' alt='helthy-img' className='vi-img'></img>
                  <img src='/images/nourishubs/front/helthy-img-fil-2.svg' alt='helthy-img' className='fil-img'></img>
                  <img src='/images/nourishubs/front/helthy-img-id-2.svg' alt='helthy-img' className='id-img'></img>
                  {/* <span>2</span> */}
                </div>
              </div>
              <div
                data-aos='fade-up'
                data-aos-easing='linear'
                data-aos-duration='700'
                className='discover-block-inner-four-inner'
              >
                <div className='common-bg-box'>
                  <img src='/images/nourishubs/front/helthy-img-en-3.svg' alt='helthy-img' className='en-img'></img>
                  <img src='/images/nourishubs/front/helthy-img-th-3.svg' alt='helthy-img' className='th-img'></img>
                  <img src='/images/nourishubs/front/helthy-img-vi-3.svg' alt='helthy-img' className='vi-img'></img>
                  <img src='/images/nourishubs/front/helthy-img-fil-3.svg' alt='helthy-img' className='fil-img'></img>
                  <img src='/images/nourishubs/front/helthy-img-id-3.svg' alt='helthy-img' className='id-img'></img>
                  {/* <span>3</span> */}
                </div>
              </div>
              <div
                data-aos='fade-up'
                data-aos-easing='linear'
                data-aos-duration='800'
                className='discover-block-inner-four-inner'
              >
                <div className='common-bg-box'>
                  <img src='/images/nourishubs/front/helthy-img-en-4.svg' alt='helthy-img' className='en-img'></img>
                  <img src='/images/nourishubs/front/helthy-img-th-4.svg' alt='helthy-img' className='th-img'></img>
                  <img src='/images/nourishubs/front/helthy-img-vi-4.svg' alt='helthy-img' className='vi-img'></img>
                  <img src='/images/nourishubs/front/helthy-img-fil-4.svg' alt='helthy-img' className='fil-img'></img>
                  <img src='/images/nourishubs/front/helthy-img-id-4.svg' alt='helthy-img' className='id-img'></img>
                  {/* <span>4</span> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <TestimonialsSection /> */}

      {/* <div className='join-section'>
        <div className='common-container'>
          <div className='join-section-inner'>
            <div className='join-section-inner-left'>
              <div className='common-title mb-none'>
                <h2>
                  {dictionary?.page?.landing?.join_our}
                  <br></br> {dictionary?.page?.landing?.healthy_food}
                </h2>
              </div>
            </div>
            <div className='join-section-inner-right'>
              <p>{dictionary?.page?.landing?.discover_school_string}</p> */}
      {/* <Button onClick={handleOnClick} className='fill-btn-common width-auto'>
                {dictionary?.common?.sign_up}
              </Button> */}
      {/* <Link href={`/${locale}/signup`} className='fill-btn-common width-auto'>
                {dictionary?.common?.sign_up}
              </Link>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  )
}

export default LandingPageWrapper
