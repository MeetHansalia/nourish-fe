'use client'

// React Imports
import { useEffect, useState, useMemo, useRef } from 'react'

// NEXT Imports
import { useParams, useRouter } from 'next/navigation'

// Table Imports
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper
} from '@tanstack/react-table'

// MUI Imports
import { Button, Grid } from '@mui/material'

// View Imports
import Statistics from './Statistics'

// Util Imports
import { API_ROUTER } from '@/utils/apiRoutes'
import { useTranslation } from '@/utils/getDictionaryClient'
import SchoolRegistrationRequestsTable from './school-registration-request/SchoolRegistrationRequestsTable'

const DocumentVerifyManagement = props => {
  const { dictionary = null } = props
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const router = useRouter()

  const [page, setPage] = useState(1)
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // doc verification count store
  const [verificationRequestCount, setVerificationRequestCount] = useState()

  // useRef for aborting request
  const abortController = useRef(null)

  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [page, itemsPerPage, globalFilter, sorting])

  return (
    <Grid container spacing={2}>
      {/* {isUserHasPermissionSections?.order_tracking && ( */}
      <Grid item xs={6} sm={2} md={12}>
        <Statistics dictionary={dictionary} verificationRequestCount={verificationRequestCount} />
        <SchoolRegistrationRequestsTable dictionary={dictionary} />
      </Grid>
      {/* )} */}
    </Grid>
  )
}

export default DocumentVerifyManagement
