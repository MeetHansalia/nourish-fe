'use client'
// React Imports
import { useEffect, useState, useMemo, useRef } from 'react'

// NEXT Imports
import { useParams } from 'next/navigation'

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
  TablePagination
} from '@mui/material'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Arrow SVG
import ChevronRight from '@menu/svg/ChevronRight'

// Util Imports
import { API_ROUTER } from '@/utils/apiRoutes'
import { useTranslation } from '@/utils/getDictionaryClient'
import { toastError, actionConfirmWithLoaderAlert, successAlert } from '@/utils/globalFunctions'
import axiosApiCall from '@utils/axiosApiCall'

const EventOrderDataTable = props => {
  //
  const { dictionary = null } = props
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)

  const [page, setPage] = useState(1)
  const [data, setData] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [isDataTableServerLoading, setIsDataTableServerLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  // useRef for aborting request
  const abortController = useRef(null)

  // Fetch Data
  const getAllEventOrders = async () => {
    // Abort the previous request if it's still pending
    if (abortController.current) {
      abortController.current.abort()
    }

    // Create a new AbortController for the new request
    abortController.current = new AbortController()

    const orderBy = sorting.reduce((acc, { id, desc }) => {
      acc[id] = desc ? 'desc' : 'asc'

      return acc
    }, {})

    const orderByString = JSON.stringify(orderBy)

    setIsDataTableServerLoading(true)

    try {
      const response = await axiosApiCall.get(API_ROUTER.SCHOOL_ADMIN.GET_ALL_EVENT_ORDER, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter,
          // orderBy: orderByString,
          orderDate: selectedDate
        },
        signal: abortController.current.signal
      })

      // const response = {}

      const allEventOrders = response?.data?.response?.data || []
      const meta = response?.data?.meta || {}

      setData(allEventOrders)
      setTotalCount(meta.totalFiltered || 0)
      setTotalPages(meta.totalPage || 1)

      // if last page have 1 only user then this...
      if (vendorMinimumThresholds.length === 0 && page > 1) {
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

  const dataWithSerialNumber = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        serialNumber: (page - 1) * itemsPerPage + index + 1
      })),
    [data, page, itemsPerPage]
  )

  // Activate User Call
  const handleActivateUser = userId => {
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for activating user
         */
        deleteUrl: `${API_ROUTER.USER_MANAGEMENT}/${userId}/status`,
        requestMethodType: 'PUT',
        title: `${dictionary?.sweet_alert?.user_activate?.title}`,
        text: `${dictionary?.sweet_alert?.user_activate?.text}`,
        customClass: {
          confirmButton: `btn bg-warning`
        },
        requestInputData: {
          status: 'active'
        }
      },
      {
        confirmButtonText: `${dictionary?.sweet_alert?.user_activate?.confirm_button}`,
        cancelButtonText: `${dictionary?.sweet_alert?.user_activate?.cancel_button}`
      },
      (callbackStatus, result) => {
        /**
         * Callback after action confirmation
         */
        if (callbackStatus) {
          getAllSuspendedUsers()
          successAlert({
            title: `${dictionary?.sweet_alert?.user_activate?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.user_activate?.ok}`
          })
        }

        getAllSuspendedUsers()
      }
    )
  }

  const columnHelper = createColumnHelper()

  const columns = useMemo(
    () => [
      columnHelper.accessor('serialNumber', {
        header: `${dictionary?.datatable?.column?.sr_no}`
      }),
      columnHelper.accessor('orderDate', {
        header: `${dictionary?.datatable?.column?.date}`
      }),
      // columnHelper.accessor('vendorId.first_name vendorId.last_name ', {
      //   header: `${dictionary?.datatable?.column?.vendor_name}`
      // }),
      columnHelper.accessor(row => `${row.vendorId.first_name} ${row.vendorId.last_name}`, {
        header: `${dictionary?.datatable?.column?.vendor_name}`
      }),

      columnHelper.accessor('deliveryType', {
        header: `${dictionary?.datatable?.column?.event_type}`
      }),
      columnHelper.accessor(
        row => {
          const totalQuantity = row?.orderItems?.reduce((sum, item) => sum + (item?.quantity || 0), 0)

          return totalQuantity
        },
        {
          header: `${dictionary?.form?.label?.quantity}`
        }
      ),

      columnHelper.accessor('deliveryAddress', {
        header: `${dictionary?.datatable?.column?.address}`
      }),
      columnHelper.accessor('Dilivery Date', {
        header: `${dictionary?.datatable?.column?.delivery_date}`
      }),
      columnHelper.accessor('orderStatus', {
        header: `${dictionary?.datatable?.column?.status}`
      })
    ],
    []
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
    getAllEventOrders()

    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [page, itemsPerPage, globalFilter, sorting, selectedDate])

  return (
    <Card>
      <CardHeader
        title={dictionary?.datatable?.event_orders_requests?.table_title}
        action={
          <>
            {/* search box commented because its not in figma */}
            {/* <TextField
              label={dictionary?.datatable?.common?.search_placeholder}
              variant='outlined'
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              fullWidth
              sx={{ maxWidth: 300 }}
            /> */}
            <AppReactDatepicker
              selected={selectedDate}
              // onChange={date => {
              //   console.log('beforeFormat', date)
              //   const formattedDate = new Date(date).toISOString().split('T')[0]

              //   console.log('formattedDate', formattedDate)
              //   setSelectedDate(formattedDate)
              // }}
              onChange={date => {
                // console.log('beforeFormat', date)

                // Adjust for local timezone offset before formatting
                const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                const formattedDate = localDate.toISOString().split('T')[0]

                // console.log('formattedDate', formattedDate)
                setSelectedDate(formattedDate)
              }}
              customInput={
                <TextField
                  // label={dictionary?.form?.placeholder?.issue_date}
                  variant='outlined'
                  fullWidth
                  sx={{ maxWidth: 150 }}
                  size='small'
                />
              }
              placeholderText={dictionary?.form?.placeholder?.issue_date}
            />
          </>
        }
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell key={header.id} onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' ? (
                      <ChevronRight fontSize='1.25rem' className='-rotate-90' />
                    ) : header.column.getIsSorted() === 'desc' ? (
                      <ChevronRight fontSize='1.25rem' className='rotate-90' />
                    ) : null}
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
            {/* {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))} */}
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
                startIndex: totalCount > 0 ? (page - 1) * itemsPerPage + 1 : 0,
                endIndex: totalCount > 0 ? Math.min(page * itemsPerPage, totalCount) : 0,
                totalFiltered: totalCount || 0
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
              count={totalPages}
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
  )
}

export default EventOrderDataTable
