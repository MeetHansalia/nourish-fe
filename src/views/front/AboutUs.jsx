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
const AboutUs = ({ mode, dictionary }) => {
  // Hooks
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const { t: t_aboutUs } = useTranslation(locale, 'about-us')

  /**
   * General function: Start
   */

  /** General function: End */

  return (
    <div className=''>
      <div className='about-title-block'>
        <div className='about-title-block-bg'>
          <div className='common-container'>
            <h1 data-aos='fade-up' data-aos-easing='linear' data-aos-duration='800'>
              {t('navigation.about_us')}
            </h1>
          </div>
        </div>
        <div className='about-title-block-inner'>
          <div className='common-container'>
            {/* <div className='about-title-block-inner-block'>
              <p>
                At <span>Nourishubs</span>, we believe that school meals should do more than just fill bellies - they
                should fuel young minds and support healthy futures. We are on a mission to make wholesome, delicious,
                yet affordable school meals accessible for everyone while making meal planning simple, enjoyable and
                stress-free.
              </p>
              <p>
                Our platform is more than just a simple ordering tool. By connecting schools with top-quality vendors,
                we are creating a community dedicated to helping parents and schools make informed, thoughtful choices
                about the food their children eat.
              </p>
              <p>
                With <span>Nourishubs</span>, parents can select nutritious, kid-friendly meals from a rotating roster
                of curated vendors, learn and track the nutritional benefits behind every meal, and personalise meals to
                suit their child's unique needs all with just a few clicks!
              </p>
              <p>
                <span>Nourishubs</span> is not just about convenience we are about creating a brighter, healthier
                tomorrow, one meal at a time. Join us in nourishing the future, inside and outside the classroom!
              </p>
              <div className='logo-about'>
                <img src='/images/nourishubs/front/logo.svg' alt='logo'></img>
              </div>
              <div className='shape-home-block'>
                <img src='/images/nourishubs/front/about-img-block.png' alt='shape-img'></img>
              </div>
            </div> */}
            <div className='about-title-block-inner-block'>
              <p data-aos='fade-up' data-aos-easing='linear' data-aos-duration='800'>
                <Trans
                  i18nKey='string_1'
                  t={t_aboutUs}
                  components={{
                    app_name_anchor: <span />
                  }}
                  values={{ app_name: themeConfig.templateName }}
                ></Trans>
              </p>
              <p data-aos='fade-up' data-aos-easing='linear' data-aos-duration='850'>
                <Trans i18nKey='string_2' t={t_aboutUs}></Trans>
              </p>
              <p data-aos='fade-up' data-aos-easing='linear' data-aos-duration='900'>
                <Trans
                  i18nKey='string_3'
                  t={t_aboutUs}
                  components={{
                    app_name_anchor: <span />
                  }}
                  values={{ app_name: themeConfig.templateName }}
                ></Trans>
              </p>
              <p data-aos='fade-up' data-aos-easing='linear' data-aos-duration='950'>
                <Trans
                  i18nKey='string_4'
                  t={t_aboutUs}
                  components={{
                    app_name_anchor: <span />
                  }}
                  values={{ app_name: themeConfig.templateName }}
                ></Trans>
              </p>
              <div className='logo-about' data-aos='fade-up' data-aos-easing='linear' data-aos-duration='950'>
                <img src='/images/nourishubs/front/logo.svg' alt='logo'></img>
              </div>
              {/* <div className='shape-home-block'>
                <img src='/images/nourishubs/front/about-img-block.png' alt='shape-img'></img>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
