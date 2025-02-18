'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { useParams } from 'next/navigation'

import classnames from 'classnames'

// Hook Imports
import { useTranslation } from 'react-i18next'

import useVerticalNav from '@menu/hooks/useVerticalNav'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks
  const { isBreakpointReached } = useVerticalNav()

  // Hooks
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)

  return (
    // <div
    // className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    // >
    // {/* <p>
    //   <span className='text-textSecondary'>{`© ${new Date().getFullYear()}, Made with `}</span>
    //   <span>{`❤️`}</span>
    //   <span className='text-textSecondary'>{` by `}</span>
    //   <Link href='https://pixinvent.com' target='_blank' className='text-primary uppercase'>
    //     Pixinvent
    //   </Link>
    // </p>
    // {!isBreakpointReached && (
    //   <div className='flex items-center gap-4'>
    //     <Link href='https://themeforest.net/licenses/standard' target='_blank' className='text-primary'>
    //       License
    //     </Link>
    //     <Link href='https://themeforest.net/user/pixinvent/portfolio' target='_blank' className='text-primary'>
    //       More Themes
    //     </Link>
    //     <Link
    //       href='https://demos.pixinvent.com/vuexy-nextjs-admin-template/documentation'
    //       target='_blank'
    //       className='text-primary'
    //     >
    //       Documentation
    //     </Link>
    //     <Link href='https://pixinvent.ticksy.com' target='_blank' className='text-primary'>
    //       Support
    //     </Link>
    //   </div>
    // )} */}
    <div className='footer-bottom flex items-center justify-center'>
      <p>
        {/* {dictionary?.footer?.copy_right} <Link href=''>{dictionary?.footer?.Nourishubs}</Link>
          {dictionary?.footer?.right_reserve} */}
        {t('footer.copy_right')}
        {t('footer.Nourishubs')}
        {t('footer.right_reserve')}
      </p>
    </div>
    // </div>
  )
}

export default FooterContent
