'use client'

// React Imports
import { useEffect, useState, useMemo, useRef } from 'react'

// NEXT Imports
import { useParams, useRouter } from 'next/navigation'

// Thirdparty Import
import classnames from 'classnames'

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
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Box
} from '@mui/material'

// View Imports

// Util Imports
import { getSession } from 'next-auth/react'

import { API_ROUTER } from '@/utils/apiRoutes'
import { useTranslation } from '@/utils/getDictionaryClient'
import { toastError, actionConfirmWithLoaderAlert, successAlert } from '@/utils/globalFunctions'
import axiosApiCall from '@utils/axiosApiCall'
import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'
import DisputeDetailsDialog from '../../parent/issue-reporting/DisputeDialogue'
import DisputeWarningDialog from './DisputeWarningDialog'
import { USER_PANELS } from '@/utils/constants'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

const DisputeListManagement = props => {
  const { dictionary = null, refreshCounts = () => {} } = props
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const router = useRouter()

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
  const [selectedDate, setSelectedDate] = useState(null)

  // doc verification count store

  // useRef for aborting request
  const abortController = useRef(null)

  const columnHelper = createColumnHelper()

  // Fetch Data

  const getRole = async () => {
    const session = await getSession()
    const userRole = session?.user?.role || ''

    console.log('roel', userRole)

    setRole(userRole)
  }

  const handleOpenDialog = rowData => {
    setSelectedRow(rowData) // Set the selected row data
    setOpenDialog(true) // Open the dialog
  }

  const handleIssueDetails = rowData => {
    setSelectedRow(rowData) // Set the selected row data
    setOpenDialog(true) // Open the dialog
    setIsIssueDetails(true)
  }

  const handleCloseIssueDetails = rowData => {
    // setSelectedRow(null) // Set the selected row data
    setOpenDialog(false)
    setIsIssueDetails(false)
  }

  const openDisputeForm = () => {
    console.log('rowData', 'rowData----')

    setOpenDisputeDialog(true)
    // setSelectedRow(rowData) // Set the selected row data
  }

  const closeDisputeForm = rowData => {
    console.log('rowData', rowData)

    setOpenDisputeDialog(false)
    setSelectedRow(null) // Set the selected row data
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

  const handleOpenDispute = () => {
    setSelectedRow(null) // Clear the selected row data
    alert('hello')
    setOpenDisputeDialog(false) // Close the dialog
  }

  const handleViewCloseDialog = () => {
    setSelectedRow(null) // Clear the selected row data
    setIsDetails(false)
    setOpenDialog(false) // Close the dialog
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
      const response = await axiosApiCall.get(API_ROUTER.ADMIN?.GET_PENDING_DISPUTE_LIST, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter,
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

  // console.log('kokok', recordMetaData)

  const columns = useMemo(
    () => [
      columnHelper.accessor('serialNumber', {
        header: `${dictionary?.datatable?.column?.serial_number}`
      }),
      columnHelper.accessor('issue_topic', {
        header: `${dictionary?.datatable?.column?.issue_topic}`
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
      columnHelper.accessor('userId.location.address', {
        id: 'address',
        header: `${dictionary?.datatable?.column?.address}`,
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
            {row.original.userId.location.address}
          </Typography>
        )
      }),
      columnHelper.accessor('issue_description', {
        header: `${dictionary?.datatable?.column?.dispute_detail}`
      }),
      columnHelper.accessor('viewDetails', {
        header: dictionary?.datatable?.column?.view,
        cell: ({ row }) => (
          <Box display='flex' alignItems='center' justifyContent='center' style={{ width: '50%', height: '40px' }}>
            <img
              src='/images/nourishubs/front/eye.png'
              alt='view-icon'
              style={{ width: '30px', height: '30px' }}
              onClick={() => {
                handleIssueDetails(row.original)
              }}
            />
          </Box>
        )
      }),
      columnHelper.accessor('view', {
        header: () => (
          <Box textAlign='center' style={{ width: '100%' }}>
            {dictionary?.datatable?.column?.status}
          </Box>
        ),
        cell: ({ row }) => (
          <Box display='flex' alignItems='center' justifyContent='center' style={{ width: '100%', height: '40px' }}>
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
          </Box>
        )
      })
    ],
    []
  )

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
  }, [page, itemsPerPage, globalFilter, sorting, selectedDate])

  // const DEBOUNCE_DELAY = 300

  // useEffect(() => {
  //   const debouncedFunctions = debounce(() => {
  //     getRole()
  //     getAllDisputes()
  //   }, DEBOUNCE_DELAY)

  //   debouncedFunctions()

  //   return () => {
  //     debouncedFunctions.cancel() // Cancel any pending debounce calls

  //     if (abortController.current) {
  //       abortController.current.abort()
  //     }
  //   }
  // }, [page, itemsPerPage, globalFilter, sorting, selectedDate])

  useEffect(() => {
    console.log('openDisputeDialog: ', openDisputeDialog)
  }, [openDisputeDialog])

  const refreshData = () => {
    setPage(1)
    setData([])
    refreshCounts()
    getAllDisputes()
  } // refresh data

  const handleFormSubmit = formData => {
    // Add your logic to save or process the form data here
    setOpenDialog(false) // Close the dialog
  }

  return (
    <div>
      <Card class='common-block-dashboard p-0'>
        <CardHeader
          className='common-block-title'
          title={dictionary?.datatable?.dispute_list_table?.table_title}
          action={
            <Box display='flex' alignItems='center' gap={2}>
              <AppReactDatepicker
                selected={selectedDate}
                onChange={date => {
                  console.log('date', date)
                  setSelectedDate(date)
                }}
                // includeDates={availableDates}
                customInput={
                  <TextField
                    label={dictionary?.form?.placeholder?.issue_date}
                    variant='outlined'
                    fullWidth
                    sx={{ maxWidth: 150 }}
                    // size='small'
                  />
                }
                placeholderText={dictionary?.form?.placeholder?.issue_date}
              />
              <TextField
                label={dictionary?.datatable?.common?.search_placeholder}
                variant='outlined'
                value={globalFilter}
                onChange={e => setGlobalFilter(e.target.value)}
                fullWidth
                sx={{ maxWidth: 200 }}
                // size='small'
              />
            </Box>
          }
        />
        <TableContainer className='table-common-block p-0' component={Paper}>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableCell key={header.id} onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {isDataTableServerLoading && (
                <tr>
                  <td colSpan={columns?.length}>
                    <LinearProgress color='primary' sx={{ height: '2px' }} />
                  </td>
                </tr>
              )}
            </TableHead>
            <TableBody>
              {globalFilter.length > 0 && table.getFilteredRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={table.getVisibleFlatColumns().length} align='center'>
                    {t('datatable.common.no_matching_data_found')}
                  </TableCell>
                </TableRow>
              ) : table.getFilteredRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={table.getVisibleFlatColumns().length} align='center'>
                    {t('datatable.common.no_data_available')}
                  </TableCell>
                </TableRow>
              ) : (
                table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => (
                    <TableRow key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <Stack direction='row' justifyContent='space-between' sx={{ padding: 2 }}> */}
        <TablePagination
          component={() => (
            <div className='flex common-pagination-block justify-between items-center flex-wrap  border-bs bs-auto  gap-2'>
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
            isDisputeDetail={true}
            onOpenDispute={openDisputeForm}
          />
        ) : // <ResponseDialo
        //   open={openDialog}
        //   setOpen={setOpenDialog}
        //   onClose={isDetails ? handleViewCloseDialog : handleCloseDialog}
        //   data={selectedRow} // Pass the selected row data to the dialog
        //   onSubmit={handleFormSubmit}
        //   isDetails={isDetails}
        // />
        null
      ) : null}
      {openDisputeDialog && (
        <DisputeWarningDialog
          dictionary={dictionary}
          open={openDisputeDialog}
          onClose={closeDisputeForm}
          details={selectedRow}
          refreshData={refreshData}
        />
      )}
    </div>
  )
}

export default DisputeListManagement
