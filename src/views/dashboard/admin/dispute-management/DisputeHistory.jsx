'use client'

// React Imports
import { useEffect, useState, useMemo, useRef } from 'react'

// NEXT Imports
import { useParams, useRouter } from 'next/navigation'

// Thirdparty Import
import classnames from 'classnames'
import { useSelector } from 'react-redux'

// Table Imports
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender
} from '@tanstack/react-table'

// MUI Imports
import {
  Card,
  CardHeader,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Paper,
  Pagination,
  TextField,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  LinearProgress,
  TablePagination,
  Grid,
  Box,
  Checkbox,
  styled
} from '@mui/material'

// View Imports

// Util Imports
import { getSession } from 'next-auth/react'

import { format } from 'date-fns'

import { isCancel } from 'axios'

import { Controller } from 'react-hook-form'

import tableStyles from '@core/styles/table.module.css'

import { API_ROUTER } from '@/utils/apiRoutes'
import { useTranslation } from '@/utils/getDictionaryClient'
import {
  toastError,
  actionConfirmWithLoaderAlert,
  successAlert,
  apiResponseErrorHandling,
  toastSuccess,
  isUserHasPermission
} from '@/utils/globalFunctions'
import axiosApiCall from '@utils/axiosApiCall'
import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'
import DisputeDetailsDialog from '../../parent/issue-reporting/DisputeDialogue'
import DisputeWarningDialog from './DisputeWarningDialog'
import ReponseDialogue from '../../parent/issue-reporting/ResponseDialogue'
import { USER_PANELS } from '@/utils/constants'
import ConfirmationDialog from './ConfirmationDialog'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomTextField from '@/@core/components/mui/TextField'

import { profileState } from '@/redux-store/slices/profile'

const DisputeHistory = props => {
  const { dictionary = null } = props
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const router = useRouter()
  const { user = null } = useSelector(profileState)
  const [page, setPage] = useState(1)
  const [data, setData] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [recordMetaData, setRecordMetaData] = useState(null)
  const [isDataTableServerLoading, setIsDataTableServerLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false) // Control dialog visibility
  const [isIssueDetails, setIsIssueDetails] = useState(false) // Control dialog visibility
  const [selectedRow, setSelectedRow] = useState(null) // Store selected row data
  const [isDetails, setIsDetails] = useState(false) // Store selected row data
  const [role, setRole] = useState('')
  const [openDisputeDialog, setOpenDisputeDialog] = useState(false) // Control dispute dialog visibility
  const [openAlert, setOpenAlert] = useState(false) // Control dialog visibility
  const [isConfirming, setIsConfirming] = useState(false) // Control dialog visibility
  const [selectedDate, setSelectedDate] = useState(null)

  // doc verification count store
  const [verificationRequestCount, setVerificationRequestCount] = useState()

  // Vars
  const isUserHasPermissionSections = useMemo(
    () => ({
      get_dispute_details: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'dispute_management',
        subPermissionsToCheck: ['get_dispute_details']
      }),
      dispute_response: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'dispute_management',
        subPermissionsToCheck: ['dispute_response']
      }),
      dispute_authority_response: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'dispute_management',
        subPermissionsToCheck: ['dispute_authority_response']
      })
    }),
    [user?.permissions]
  )

  const filterData = [
    { id: 1, name: dictionary?.common?.all, value: 'All' },
    { id: 2, name: dictionary?.common?.completed, value: true },
    { id: 3, name: dictionary?.common?.ongoing, value: false }
  ]

  const [selectedFilter, setSelectedFilter] = useState(dictionary?.datatable?.column?.all)

  const CheckboxInput = styled(Checkbox, {
    name: 'MuiCustomInputHorizontal',
    slot: 'input'
  })(({ theme }) => ({
    marginBlockStart: theme.spacing(-0.25),
    marginInlineStart: theme.spacing(-0.25)
  }))

  // useRef for aborting request
  const abortController = useRef(null)

  const columnHelper = createColumnHelper()

  // Fetch Data

  const getDate = date => {
    const formattedDate = format(new Date(date), 'dd MMM, yyyy - hh:mm a')

    return formattedDate
  }

  const getRole = async () => {
    const session = await getSession()
    const userRole = session?.user?.role || ''

    setRole(userRole)
  }

  const handleOpenDialog = rowData => {
    setSelectedRow(rowData) // Set the selected row data
    setOpenDialog(true) // Open the dialog
  }

  const handleViewOpenDialog = rowData => {
    setSelectedRow(rowData) // Set the selected row data
    setIsDetails(true)
    setOpenDialog(true) // Open the dialog
  }

  const handleCloseDialog = () => {
    setSelectedRow(null) // Clear the selected row data
    setOpenDialog(false) // Close the dialog
  }

  const handleViewCloseDialog = () => {
    setSelectedRow(null) // Clear the selected row data
    setIsDetails(false)
    setOpenDialog(false) // Close the dialog
  }

  const handleOpenAlert = rowData => {
    setSelectedRow(rowData) // Set the selected row data

    setOpenAlert(true) // Open the alert
  }

  const handleCloseAlert = () => {
    setSelectedRow(null) // Set the selected row data

    setOpenAlert(false) // Open the alert
  }

  const handleCompleteDispute = async details => {
    // Call the API to complete the dispute
    const url = `${API_ROUTER?.ADMIN?.MARK_AS_COMPLETE}/${details._id}`

    setIsConfirming(true)

    const payload = { isCompleted: true }

    await axiosApiCall
      .post(url, payload)
      .then(response => {
        const responseBody = response?.data

        toastSuccess(responseBody?.message)
        refreshData()
        setIsConfirming(false)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsConfirming(false)

          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })

    setOpenAlert(false) // Open the alert
  }

  const getAllDisputes = async () => {
    // Abort the previous request if it's still pending
    if (abortController.current) {
      abortController.current.abort()
    }

    // Create a new AbortController for the new request
    abortController.current = new AbortController()

    // const orderBy = sorting.reduce((acc, { id, desc }) => {
    //   acc[id] = desc ? 'desc' : 'asc'

    //   return acc
    // }, {})

    // const orderByString = JSON.stringify(orderBy)

    setIsDataTableServerLoading(true)

    try {
      const response = await axiosApiCall.get(API_ROUTER.ADMIN?.GET_WARNED_DISPUTE_LIST, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter,
          isCompleted: selectedFilter,
          issueDate: selectedDate
        },
        signal: abortController.current.signal
      })

      const users = response?.data?.response?.issues || []

      setData(users)
      // setTotalCount(meta.totalFiltered || 0)
      // setTotalPages(meta.totalPage || 1)

      const meta1 = response?.data?.meta || {}

      setRecordMetaData(meta1)

      setVerificationRequestCount(response?.data?.response?.documentVerificationRequestsCount)

      // if last page have 1 only user then this...
      if (users.length === 0 && page > 1) {
        setPage(prevPage => prevPage - 1)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Handle errors only if it's not an abort error
        toastError(error?.response?.data?.message)
      }
    }

    setIsDataTableServerLoading(false)
  }

  const columns = useMemo(() => {
    const cols = [
      columnHelper.accessor('serialNumber', {
        header: `${dictionary?.datatable?.column?.serial_number}`
      }),
      columnHelper.accessor('issue_topic', {
        header: `${dictionary?.datatable?.column?.dispute_detail}`
      }),
      columnHelper.accessor(row => `${row.userId.first_name} ${row.userId.last_name}`, {
        id: 'name',
        header: `${dictionary?.datatable?.column?.disputer_name}`,
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
            {`${row.original.userId.first_name} ${row.original.userId.last_name}`}
          </Typography>
        )
      }),
      columnHelper.accessor('vendorId._id', {
        id: 'vendorId',
        header: `${dictionary?.datatable?.column?.dispute_authority}`,
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
            {row.original.vendorId?.first_name
              ? `${row.original.vendorId?.first_name} ${row.original.vendorId?.last_name}`
              : 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('createdAt', {
        header: `${dictionary?.datatable?.column?.dispute_raise}`,
        cell: ({ row }) => {
          const formattedDate = getDate(row?.original?.createdAt)

          return (
            <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
              {formattedDate}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('view', {
        header: () => (
          <Box textAlign='center' style={{ width: '100%' }}>
            {dictionary?.form?.label?.status}
          </Box>
        ),
        cell: ({ row }) => (
          <Box display='flex' alignItems='center' justifyContent='center' style={{ width: '100%', height: '40px' }}>
            {row?.original?.replies?.length > 0 && (
              <>
                <CheckboxInput
                  color={'primary'}
                  checked={row?.original?.isCompleted}
                  onChange={() => handleOpenAlert(row.original)}
                  disabled={row?.original?.isCompleted}
                />
                {isUserHasPermissionSections?.get_dispute_details && (
                  <Button
                    variant='contained'
                    color='primary'
                    sx={{ px: 2, mx: 1 }}
                    onClick={() => handleViewOpenDialog(row.original)}
                  >
                    {dictionary?.datatable?.button?.details}
                  </Button>
                )}
                {isUserHasPermissionSections?.dispute_response && (
                  <Button
                    variant='contained'
                    color='primary'
                    sx={{ px: 2, mx: 1 }}
                    onClick={() => handleOpenDialog(row.original)}
                  >
                    {dictionary?.datatable?.button?.response}
                  </Button>
                )}
              </>
            )}
            {isUserHasPermissionSections?.dispute_authority_response && (
              <Button
                disabled={row?.original?.vendorId?.status === 'suspended'}
                variant='contained'
                color='primary'
                sx={{ px: 2, mx: 1 }}
                onClick={() => {
                  const param = JSON.stringify(row?.original?.vendorId)

                  localStorage.setItem('disputeParam', param)
                  router.push(`/${locale}/${USER_PANELS?.admin}/dispute-management/suspend`)
                }}
              >
                {row?.original?.vendorId?.status === 'suspended' ? 'Suspended' : dictionary?.datatable?.button?.suspend}
              </Button>
            )}
          </Box>
        )
      })
    ]

    return cols
  }, [dictionary, isUserHasPermissionSections, locale, router])

  const dataWithSerialNumber = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        serialNumber: (page - 1) * itemsPerPage + index + 1
      })),
    [data, page, itemsPerPage]
  )

  const table = useReactTable({
    data: dataWithSerialNumber,
    columns,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: itemsPerPage
      },
      columnFilters,
      globalFilter,
      sorting
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true
  })

  const handlePageChange = (_, newPage) => {
    setPage(newPage)
    table.setPageIndex(newPage - 1)
  }

  useEffect(() => {
    getRole()
    getAllDisputes()

    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [page, itemsPerPage, globalFilter, sorting, selectedFilter, selectedDate])

  const refreshData = () => {
    setPage(1)
    setData([])
    getAllDisputes()
  } // refresh data

  const handleFormSubmit = formData => {
    // Add your logic to save or process the form data here
    setOpenDialog(false) // Close the dialog
  }

  return (
    <div>
      <Card>
        <CardHeader
          title={dictionary?.datatable?.dispute_history_table?.table_title}
          action={
            <Box display='flex' alignItems='center' gap={2}>
              {/* Dropdown (All) */}
              <CustomTextField
                select
                label={dictionary?.datatable?.common?.dropdown_label}
                value={selectedFilter}
                onChange={event => {
                  setSelectedFilter(event.target.value)
                  // Trigger API call
                }}
                sx={{ minWidth: 150, height: 40 }}
              >
                {filterData?.map(item => (
                  <MenuItem value={item?.value} key={item?.id}>
                    {dictionary?.common?.[item?.name] || item?.name} {/* Language-specific name */}
                  </MenuItem>
                ))}
              </CustomTextField>

              {/* Date Selector */}

              <AppReactDatepicker
                selected={selectedDate}
                onChange={date => {
                  setSelectedDate(date)
                }}
                customInput={
                  <TextField
                    label={dictionary?.form?.placeholder?.issue_date}
                    variant='outlined'
                    fullWidth
                    sx={{ maxWidth: 150 }}
                    size='small'
                  />
                }
                placeholderText={dictionary?.form?.placeholder?.issue_date}
              />

              {/* Search Bar */}
              <TextField
                label={dictionary?.datatable?.common?.search_placeholder}
                variant='outlined'
                value={globalFilter}
                onChange={e => setGlobalFilter(e.target.value)}
                fullWidth
                sx={{ maxWidth: 150 }}
                size='small'
              />
            </Box>
          }
        />

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
              {isDataTableServerLoading && (
                <tr>
                  <td colSpan={columns?.length}>
                    <LinearProgress color='primary' sx={{ height: '2px' }} />
                  </td>
                </tr>
              )}
            </thead>
            <tbody>
              {globalFilter.length > 0 && table.getFilteredRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    {t('datatable.common.no_matching_data_found')}
                  </td>
                </tr>
              ) : table.getFilteredRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    {t('datatable.common.no_data_available')}
                  </td>
                </tr>
              ) : (
                table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
        {/* <Stack direction='row' justifyContent='space-between' sx={{ padding: 2 }}> */}
        <TablePagination
          component={() => (
            <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
              <Typography color='text.disabled'>
                {t('datatable.common.footer_showing_entries', {
                  startIndex: recordMetaData?.totalFiltered > 0 ? (page - 1) * itemsPerPage + 1 : 0,
                  endIndex:
                    recordMetaData?.totalFiltered > 0
                      ? Math.min(page * itemsPerPage, recordMetaData?.totalFiltered)
                      : 0,
                  totalFiltered: recordMetaData?.totalFiltered || 0
                })}
              </Typography>
              <FormControl variant='outlined' size='small'>
                <div className='flex items-center gap-2 is-full sm:is-auto'>
                  <Typography className='hidden sm:block'>{dictionary?.datatable?.common?.show}</Typography>
                  <Select value={itemsPerPage} onChange={e => setItemsPerPage(e.target.value)}>
                    <MenuItem value={5}>05</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={15}>15</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                  </Select>
                </div>
              </FormControl>
              <Pagination
                showFirstButton
                showLastButton
                count={recordMetaData?.totalPage}
                page={page}
                onChange={handlePageChange}
                shape='rounded'
                color='primary'
                variant='tonal'
              />
              {/* </Stack> */}
            </div>
          )}
        />
      </Card>
      {openDialog ? (
        isIssueDetails ? (
          <DisputeDetailsDialog
            dictionary={dictionary}
            open={openDialog}
            onClose={handleCloseIssueDetails}
            details={selectedRow} // Pass dynamic data here
          />
        ) : (
          <ReponseDialogue
            dictionary={dictionary}
            open={openDialog}
            isDispute={true}
            setOpen={setOpenDialog}
            onClose={isDetails ? handleViewCloseDialog : handleCloseDialog}
            data={selectedRow} // Pass the selected row data to the dialog
            onSubmit={handleFormSubmit}
            isDetails={isDetails}
            refreshData={refreshData}
          />
        )
      ) : null}

      {openAlert && (
        <ConfirmationDialog
          dictionary={dictionary}
          open={openAlert}
          details={selectedRow}
          onClose={handleCloseAlert}
          title={dictionary?.dialog?.complete_dispute}
          descriptionText={dictionary?.dialog?.complete_dispute_desc}
          rightButtonTitle={dictionary?.form?.button?.cancel}
          leftButtonTitle={dictionary?.form?.button?.confirm}
          onSubmitConfirm={handleCompleteDispute}
          isConfirmSubmiting={isConfirming}
        />
      )}
    </div>
  )
}

export default DisputeHistory
