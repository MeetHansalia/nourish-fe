'use client'

import React, { useState } from 'react'

import dynamic from 'next/dynamic'

import { useParams } from 'next/navigation'

import { Box, Tabs, Tab } from '@mui/material'

import ModifierGroupDataTable from './ModifierGroupDataTable'

import { useTranslation } from '@/utils/getDictionaryClient'

const CategoryDataTable = dynamic(() => import('./CategoryDataTable'), {
  ssr: false
})

const DishDataTable = dynamic(() => import('./DishDataTable'), {
  ssr: false
})

function TabBar({ tabValue, onTabChange, dictionary, getId }) {
  const { lang: locale } = useParams()

  const { t } = useTranslation(locale)

  const getCategory = id => {
    getId(id, 0)
  }

  const getDishID = id => {
    getId(id, 1)
  }

  const getModifierGroupID = id => {
    getId(id, 2)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={tabValue}
        onChange={onTabChange}
        textColor='secondary'
        indicatorColor='secondary'
        aria-label='menu management tabs'
      >
        <Tab label={t('form.label.add_category')} />
        <Tab label={t('form.label.add_dish')} />
        <Tab label={t('form.label.add_modifier_group')} />
      </Tabs>

      <Box sx={{ p: 2 }}>
        {tabValue === 0 && <CategoryDataTable dictionary={dictionary} getId={getCategory} />}
        {tabValue === 1 && (
          <div>
            <DishDataTable getId={getDishID} />
          </div>
        )}
        {tabValue === 2 && (
          <div>
            <ModifierGroupDataTable getId={getModifierGroupID} />
          </div>
        )}
      </Box>
    </Box>
  )
}

export default TabBar
