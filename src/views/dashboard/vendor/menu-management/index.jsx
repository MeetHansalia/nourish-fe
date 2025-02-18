'use client'

import React, { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import { Button } from '@mui/material'

import AddCategoryForm from './AddCategoryForm'

import AddDishForm from './AddDishForm'

import AddModifierGroupForm from './AddModifierGroupForm'

import TabBar from './Tabbar'

import MenuBar from './Menu'

import { useTranslation } from '@/utils/getDictionaryClient'

function ParentComponent(props) {
  const { lang: locale } = useParams()

  const { t } = useTranslation(locale)
  const { dictionary = null } = props
  const [tabValue, setTabValue] = useState(0) // Active tab index
  const [isPageOpen, setIsPageOpen] = useState(false) // Whether a page is open
  const [currentTabIndex, setCurrentTabIndex] = useState(0) // To track which tab to go back to
  const [pageContent, setPageContent] = useState(null)
  const [editId, setEditId] = useState(null)
  const [isEdit, SetIsEdit] = useState(false)

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleOpenPage = tabIndex => {
    setCurrentTabIndex(tabIndex)
    setIsPageOpen(true)
    SetIsEdit(false)
    setEditId(null)
    setPageContent(getPageContent(tabIndex))
  }

  const handleBackToTabs = tabValue => {
    setIsPageOpen(false)
    SetIsEdit(false)
    setEditId(null)
    setPageContent(null)
    setTabValue(tabValue)
    setPageContent(tabValue)
  }

  const getId = (id, tabIndex) => {
    setEditId(id)
    setCurrentTabIndex(tabIndex)
    setIsPageOpen(true)
    SetIsEdit(true)

    setPageContent(getPageContent(tabIndex, id))
  }

  const getPageContent = (tabIndex, editId) => {
    switch (tabIndex) {
      case 0:
        return <AddCategoryForm handleBackToTabs={handleBackToTabs} tabValue={tabIndex} editId={editId} />

      case 1:
        return <AddDishForm handleBackToTabs={handleBackToTabs} tabValue={tabIndex} editId={editId} />

      case 2:
        return <AddModifierGroupForm handleBackToTabs={handleBackToTabs} tabValue={tabIndex} editId={editId} />

      default:
        return <div>Page Not Found</div>
    }
  }

  return (
    <>
      <MenuBar tabValue={tabValue} onTabChange={handleTabChange} onOpenPage={handleOpenPage} isEdit={isEdit} />
      {!isPageOpen ? (
        <TabBar tabValue={tabValue} onTabChange={handleTabChange} dictionary={dictionary} getId={getId} />
      ) : (
        <div style={{ padding: '16px' }}>
          {/* <Button variant='contained' onClick={handleBackToTabs}>
            {t('form.button.back')}
          </Button> */}
          {pageContent}
        </div>
      )}
    </>
  )
}

export default ParentComponent
