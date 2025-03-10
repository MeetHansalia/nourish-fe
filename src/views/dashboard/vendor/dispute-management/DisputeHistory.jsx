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

import { API_ROUTER } from '@/utils/apiRoutes'
import { useTranslation } from '@/utils/getDictionaryClient'
import { toastError, apiResponseErrorHandling, toastSuccess } from '@/utils/globalFunctions'
import axiosApiCall from '@utils/axiosApiCall'
import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'
import DisputeDetailsDialog from '../../parent/issue-reporting/DisputeDialogue'
import ReponseDialogue from '../../parent/issue-reporting/ResponseDialogue'
import { USER_PANELS } from '@/utils/constants'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomTextField from '@/@core/components/mui/TextField'
import ConfirmationDialog from '../../admin/dispute-management/ConfirmationDialog'

const DisputeHistory = props => {
  const { dictionary = null } = props
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
  const [openAlert, setOpenAlert] = useState(false) // Control dialog visibility
  const [isConfirming, setIsConfirming] = useState(false) // Control dialog visibility
  const [selectedDate, setSelectedDate] = useState(null)

  // doc verification count store
  const [verificationRequestCount, setVerificationRequestCount] = useState()

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

  const handleIssueDetails = rowData => {
    setSelectedRow(rowData) // Set the selected row data
    setOpenDialog(true) // Open the dialog
    setIsIssueDetails(true)
  }

  const handleCloseIssueDetails = rowData => {
    setSelectedRow(null) // Set the selected row data
    setOpenDialog(false)
    setIsIssueDetails(false)
  }

  const handleCloseAlert = () => {
    setSelectedRow(null) // Set the selected row data

    setOpenAlert(false) // Open the alert
  }

  const getAllDisputes = async () => {
    // Abort the previous request if it's still pending
    if (abortController.current) {
      abortController.current.abort()
    }

    // Create a new AbortController for the new request
    abortController.current = new AbortController()

    setIsDataTableServerLoading(true)

    try {
      const response = await axiosApiCall.get(API_ROUTER.VENDOR?.GET_DISPUTE_LIST, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter,
          status: 'Ongoing',
          disputeDate: selectedDate ? format(new Date(selectedDate), 'yyyy-MM-dd') : ''
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

  const columns = useMemo(
    () => [
      columnHelper.accessor('serialNumber', {
        header: `${dictionary?.datatable?.column?.serial_number}`
      }),
      columnHelper.accessor('issue_topic', {
        header: `${dictionary?.datatable?.column?.issue_topic}`,
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
            {`${row?.original?.issueId?.issue_topic}`}
          </Typography>
        )
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
      columnHelper.accessor('description', {
        id: 'address',
        header: `${dictionary?.datatable?.column?.dispute_detail}`,
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
            {row.original.description}
          </Typography>
        )
      }),
      columnHelper.accessor('disputeDate', {
        header: `${dictionary?.datatable?.column?.dispute_raise}`
      }),
      columnHelper.accessor('viewDetails', {
        header: `${dictionary?.datatable?.column?.view}`,
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
            {dictionary?.form?.label?.status}
          </Box>
        ),
        cell: ({ row }) => (
          <Box display='flex' alignItems='center' justifyContent='center' style={{ width: '100%', height: '40px' }}>
            <>
              {row.original.replies?.length > 0 && (
                <Button
                  variant='contained'
                  color='primary'
                  sx={{ px: 2, mx: 1 }}
                  onClick={() => handleViewOpenDialog(row.original)} // Pass the row data to open the dialog
                >
                  {dictionary?.datatable?.button?.details}
                </Button>
              )}

              <Button
                variant='contained'
                color='primary'
                sx={{ px: 2, mx: 1 }}
                onClick={() => handleOpenDialog(row.original)} // Pass the row data to open the dialog
              >
                {dictionary?.datatable?.button?.response}
              </Button>
            </>
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
      <Card class='common-block-dashboard p-0'>
        <CardHeader
          className='common-block-title mb-0'
          title={dictionary?.datatable?.dispute_history_table?.table_title}
          action={
            <Box display='flex' alignItems='center' gap={2}>
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

        <TableContainer className='table-common-block' component={Paper}>
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
                  <td className='no-pad-td' colSpan={columns?.length}>
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
            details={selectedRow}
            isDisputeDetail={false}
            isVendorDetail={true}
            // Pass dynamic data here
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
