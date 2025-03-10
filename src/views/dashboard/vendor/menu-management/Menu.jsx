import React from 'react'

import { useParams } from 'next/navigation'

import AppBar from '@mui/material/AppBar'

import Toolbar from '@mui/material/Toolbar'

import Typography from '@mui/material/Typography'

import Button from '@mui/material/Button'

import Box from '@mui/material/Box'

import { useTranslation } from '@/utils/getDictionaryClient'

function MenuBar({ tabValue, onOpenPage, isEdit }) {
  const { lang: locale } = useParams()

  const { t } = useTranslation(locale)

  return (
    <Box className='common-block-dashboard menu-management-block'>
      <AppBar position='static' color='default'>
        <Toolbar>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            {t('form.label.menu_management')}
          </Typography>

          {!isEdit && (
            <>
              {tabValue === 0 && (
                <Button
                  className='theme-common-btn theme-btn-color'
                  variant='contained'
                  color='success'
                  onClick={() => onOpenPage(0)}
                >
                  {t('form.label.add_category')}
                </Button>
              )}
              {tabValue === 1 && (
                <Button
                  className='theme-common-btn theme-btn-color'
                  variant='contained'
                  color='primary'
                  onClick={() => onOpenPage(1)}
                  sx={{ mx: 1 }}
                >
                  {t('form.label.add_dish')}
                </Button>
              )}
              {tabValue === 2 && (
                <Button
                  className='theme-common-btn theme-btn-color'
                  variant='contained'
                  color='secondary'
                  onClick={() => onOpenPage(2)}
                >
                  {t('form.label.add_modifier_group')}
                </Button>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default MenuBar
