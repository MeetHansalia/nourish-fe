'use client'

// React Imports
import { useEffect, useState, useMemo, useRef } from 'react'

// NEXT Imports
import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

// Third-party Import
import classnames from 'classnames'
import { isCancel } from 'axios'

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

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Arrow SVG
import ChevronRight from '@menu/svg/ChevronRight'

// Component Imports
import DebouncedInput from '@/components/nourishubs/DebouncedInput'

// Util Imports
import { API_ROUTER } from '@/utils/apiRoutes'
import { useTranslation } from '@/utils/getDictionaryClient'
import { toastError, apiResponseErrorHandling, getPanelName } from '@/utils/globalFunctions'
import axiosApiCall from '@utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'

/**
 * Page
 */
const EventOrderDataTable = props => {
  // Props
  const { dictionary = null } = props

  // Hooks
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const router = useRouter()
  const pathname = usePathname()
  const panelName = getPanelName(pathname)

  /**
   * Datatable: Start
   */
  // States
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

  // Refs
  const abortController = useRef(null)

  // Fetch Data
  const getAllEventOrders = async () => {
    if (abortController.current) {
      abortController.current.abort()
    }

    abortController.current = new AbortController()

    const orderBy = sorting.reduce((acc, { id, desc }) => {
      acc[id] = desc ? -1 : 1

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
          orderBy: orderByString,
          orderDate: selectedDate
        },
        signal: abortController.current.signal
      })

      const allEventOrders = response?.data?.response?.data || []
      const meta = response?.data?.meta || {}

      setData(allEventOrders)
      setTotalCount(meta.totalFiltered || 0)
      setTotalPages(meta.totalPage || 1)

      // if last page have only 1 record then this...
      if (allEventOrders?.length === 0 && page > 1) {
        setPage(prevPage => prevPage - 1)
      }
    } catch (error) {
      if (!isCancel(error)) {
        const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

        toastError(apiResponseErrorHandlingData)
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

  const columnHelper = createColumnHelper()

  const columns = useMemo(
    () => [
      columnHelper.accessor('serialNumber', {
        header: `${dictionary?.datatable?.column?.sr_no}`,
        enableSorting: false
      }),
      columnHelper.accessor('orderDate', {
        header: `${dictionary?.datatable?.column?.date}`
      }),
      // columnHelper.accessor('vendorId.first_name vendorId.last_name ', {
      //   header: `${dictionary?.datatable?.column?.vendor_name}`
      // }),
      columnHelper.accessor(row => `${row?.vendorName}`, {
        header: `${dictionary?.datatable?.column?.vendor_name}`,
        id: 'vendorName'
      }),

      columnHelper.accessor(row => `${row?.eventName}`, {
        header: `${dictionary?.form?.label?.event_name}`,
        enableSorting: false
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
      columnHelper.accessor('deliveryDate', {
        header: `${dictionary?.datatable?.column?.delivery_date}`
      }),
      columnHelper.accessor('orderStatus', {
        header: `${dictionary?.datatable?.column?.status}`,
        enableSorting: false
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
      if (abortController?.current) {
        abortController?.current?.abort()
      }
    }
  }, [page, itemsPerPage, globalFilter, sorting, selectedDate])
  /** Datatable: End */

  return (
    <Card className='common-block-dashboard table-block-no-pad'>
      <CardHeader
        className='common-block-title'
        title={dictionary?.datatable?.event_orders_requests?.table_title}
        action={
          <div className='flex max-sm:flex-col max-sm:is-full sm:items-center gap-4'>
            <Link href={getLocalizedUrl(`/${panelName}/order-management/add`, locale)}>
              <Button variant='contained'>{dictionary?.page?.order_management?.add_new_order}</Button>
            </Link>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder={dictionary?.datatable?.common?.search_placeholder}
            />

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
          </div>
        }
        // className='flex-wrap gap-4'
      />
      {/* <Button variant='contained' onClick={() => router.push(`order-management/add`)}>
        {dictionary?.page?.order_management?.add_new_order}
      </Button> */}
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: <i className='tabler-chevron-up text-xl' />,
                      desc: <i className='tabler-chevron-down text-xl' />
                    }[header.column.getIsSorted()] ?? null}
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
            {/* {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))} */}
            {globalFilter.length > 0 && table.getFilteredRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} align='center'>
                  {t('datatable.common.no_matching_data_found')}
                </td>
              </tr>
            ) : table.getFilteredRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} align='center'>
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
          </div>
        )}
      />
    </Card>
  )
}

export default EventOrderDataTable
