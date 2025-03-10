'use client'

// React Imports
import { useState, useEffect, useMemo, useRef } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Pagination,
  TextField,
  Tooltip
} from '@mui/material'
import { tooltipClasses } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'

// React Table Imports
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender
} from '@tanstack/react-table'

import moment from 'moment'

import { isCancel } from 'axios'

import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { useTranslation } from '@/utils/getDictionaryClient'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const CustomWidthTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: '50%'
  }
})

/**
 * Page
 */
const OrdersTableComponent = ({ mode, dictionary }) => {
  // Hooks
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const { t: t_aboutUs } = useTranslation(locale, 'about-us')

  // States
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [recordMetaData, setRecordMetaData] = useState(null)
  const [page, setPage] = useState(1)
  const [isDataTableServerLoading, setIsDataTableServerLoading] = useState(true)
  const [columnFilters, setColumnFilters] = useState([])
  const [sorting, setSorting] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reasonText, setReasonText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSchoolId, setSelectedSchoolId] = useState(null)
  const [selectedOrders, setSelectedOrders] = useState(null)
  const [completeStatus, setCompleteStatus] = useState(false)

  const abortController = useRef(null)

  const columnHelper = createColumnHelper()

  const handleAction = async (action, schoolId, orders) => {
    try {
      let axiosApiCallUrl = API_ROUTER.VENDOR.UPDATE_ORDER_STATUS(schoolId)

      const apiFormData = {
        orderDate: moment(orders[0].orderDate).format('YYYY-MM-DD'),
        orderType: orders[0].orderType,
        orderStatus: action
      }

      axiosApiCall({
        method: 'put',
        url: axiosApiCallUrl,
        data: apiFormData
      })
        .then(response => {
          const responseBody = response?.data

          toastSuccess(responseBody?.message)
          setIsDialogOpen(false)
        })
        .catch(error => {
          console.log('error', error)

          if (!isCancel(error)) {
            const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

            toastError(apiResponseErrorHandlingData)
          }
        })
    } catch (error) {
      console.log('error====>', error)
      toastError(error.response?.data?.message || 'Action failed')
    } finally {
      getDataForInquiryTable()
    }
  }

  // handle Approve/Reject api call
  const handleReject = async () => {
    setIsLoading(true)

    let axiosApiCallUrl = API_ROUTER.VENDOR.UPDATE_ORDER_STATUS(selectedSchoolId)

    const apiFormData = {
      orderDate: moment(selectedOrders[0].orderDate).format('YYYY-MM-DD'),
      orderType: selectedOrders[0].orderType,
      reason: reasonText,
      orderStatus: 'reject'
    }

    try {
      const response = await axiosApiCall({
        method: 'put',
        url: axiosApiCallUrl,
        data: apiFormData
      })

      const responseBody = response?.data

      toastSuccess(responseBody?.message)
      setIsDialogOpen(false)
    } catch (error) {
      console.log('error', error)

      if (!isCancel(error)) {
        const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

        toastError(apiResponseErrorHandlingData)
      }
    } finally {
      setIsLoading(false)
      getDataForInquiryTable()
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('serialNumber', {
        header: `${dictionary?.datatable?.column?.serial_number}`
      }),
      columnHelper.accessor('schoolName', {
        header: `${dictionary?.datatable?.column?.school_name}`,
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
            {`${row?.original?._id?.schoolName}`}
          </Typography>
        )
      }),
      columnHelper.accessor('orderDate', {
        header: `${dictionary?.datatable?.column?.order_date}`,
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
            {`${row?.original?.orders[0]?.orderDate}`}
          </Typography>
        )
      }),
      columnHelper.accessor('orderType', {
        header: `${dictionary?.datatable?.column?.order_type}`,
        // cell: info => info.getValue()
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
            {`${row?.original?.orders[0]?.orderType}`}
          </Typography>
        )
      }),
      columnHelper.accessor('delivery_date', {
        header: `${dictionary?.datatable?.column?.delivery_date}`,
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
            {`${row?.original?.orders?.[0]?.deliveryDate}`}
          </Typography>
        )
      }),
      columnHelper.accessor('expectedDeliveryDate', {
        header: `${dictionary?.datatable?.column?.expected_delivery_date}`,
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
            {`${row?.original?.orders?.[0]?.schoolInfo?.expectedDeliveryTime}`}
          </Typography>
        )
      }),

      columnHelper.accessor('totalOrders', {
        header: `${dictionary?.datatable?.column?.total_no_of_orders}`,
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
            {`${row?.original?.totalOrders}`}
          </Typography>
        )
      }),
      columnHelper.accessor('Actions', {
        header: `${dictionary?.datatable?.column?.actions}`,
        cell: ({ row }) => (
          <Box display='flex' flexDirection='column' gap={1}>
            <div>{row?.original?.message}</div>
            <Box display='flex' gap={1}>
              <Button
                variant={row?.original?._id?.orderStatus === 'accepted' ? 'contained' : 'outlined'}
                color='primary'
              >
                Active
              </Button>
              <Button
                variant={row?.original?._id?.orderStatus === 'delivered' ? 'contained' : 'outlined'}
                color='primary'
                onClick={() => handleAction('delivered', row?.original?._id?.schoolId, row?.original?.orders)}
              >
                Complete
              </Button>
            </Box>
          </Box>
        )
      })
    ],
    []
  )

  const dataWithSerialNumber = useMemo(
    () =>
      data?.map((item, index) => ({
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
    manualPagination: true,
    manualSorting: true
  })

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  // Fetch Data
  const getDataForInquiryTable = async () => {
    if (abortController.current) {
      abortController.current.abort()
    }

    // Create a new AbortController for the new request
    abortController.current = new AbortController()

    setIsDataTableServerLoading(true)

    try {
      const response = await axiosApiCall.get(API_ROUTER.VENDOR.GET_REGULAR_ORDERS, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter
          // orderBy: '{"_id" : "-1"}'
        },
        signal: abortController.current.signal
      })

      const allOrders = response?.data?.response?.ordersList || []
      const meta1 = response?.data?.meta || {}

      setRecordMetaData(meta1)

      setData(allOrders)
      setCompleteStatus(true)
      // setTotalCount(meta1.totalFiltered || 0)
    } catch (error) {
      if (error.name !== 'AbortError') {
        toastError(error?.response?.data?.message)
      }
    } finally {
      setCompleteStatus(false)
    }

    setIsDataTableServerLoading(false)
  }

  useEffect(() => {
    getDataForInquiryTable()

    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [page, itemsPerPage, globalFilter])

  useEffect(() => {
    setPage(1)
  }, [globalFilter, itemsPerPage])

  return (
    <div className=''>
      <div className='about-title-block'>
        {/* <div className='about-title-block-bg'>
          <div className='common-container'>
            <h1 data-aos='fade-up' data-aos-easing='linear' data-aos-duration='800'>
              {dictionary?.datatable?.contact_us_inquiry_table?.table_title}
            </h1>
          </div>
        </div> */}
        <div className='my-10'>
          <div className='common-container'>
            <div className='about-title-block-inner-block'>
              <Card>
                <CardContent className='flex justify-between flex-col items-start md:items-center md:flex-row gap-4'>
                  <div className='flex flex-col sm:flex-row items-center justify-between gap-4 is-full sm:is-auto'>
                    <div className='flex items-center gap-2 is-full sm:is-auto'>
                      <Typography className='hidden sm:block'>{dictionary?.datatable?.common?.show}</Typography>
                      <CustomTextField
                        select
                        value={itemsPerPage || 10}
                        onChange={e => setItemsPerPage(e.target.value)}
                        className='is-[70px] max-sm:is-full'
                      >
                        <MenuItem value='5'>05</MenuItem>
                        <MenuItem value='10'>10</MenuItem>
                        <MenuItem value='25'>25</MenuItem>
                        <MenuItem value='50'>50</MenuItem>
                      </CustomTextField>
                    </div>
                  </div>
                  <div className='flex max-sm:flex-col max-sm:is-full sm:items-center gap-4'>
                    <DebouncedInput
                      value={globalFilter ?? ''}
                      onChange={value => setGlobalFilter(String(value))}
                      placeholder={dictionary?.datatable?.common?.search_placeholder}
                      className='max-sm:is-full sm:is-[250px]'
                    />
                  </div>
                </CardContent>
                <div className='overflow-x-auto'>
                  <table className={tableStyles.table}>
                    <thead>
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th key={header.id}>
                              {header.isPlaceholder ? null : (
                                <>
                                  <div
                                    className={classnames({
                                      'flex items-center': header.column.getIsSorted(),
                                      'select-none': header.column.getCanSort()
                                    })}
                                    onClick={header.column.getToggleSortingHandler()}
                                  >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                  </div>
                                </>
                              )}
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
                    {globalFilter.length > 0 && table.getFilteredRowModel().rows.length === 0 ? (
                      <tbody>
                        <tr>
                          <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                            {t('datatable.common.no_matching_data_found')}
                          </td>
                        </tr>
                      </tbody>
                    ) : table.getFilteredRowModel().rows.length === 0 ? (
                      <tbody>
                        <tr>
                          <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                            {t('datatable.common.no_data_available')}
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody>
                        {table
                          .getRowModel()
                          .rows.slice(0, table.getState().pagination.pageSize)
                          .map(row => (
                            <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                              {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    )}
                  </table>
                </div>
                {recordMetaData?.total > 0 && (
                  <TablePagination
                    component={() => (
                      <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
                        <Typography color='text.disabled'>
                          {t('datatable.common.footer_showing_entries', {
                            startIndex: recordMetaData?.startIndex || 0,
                            endIndex: recordMetaData?.endIndex || 0,
                            totalFiltered: recordMetaData?.totalFiltered || 0
                          })}
                        </Typography>

                        <Pagination
                          shape='rounded'
                          color='primary'
                          variant='tonal'
                          count={recordMetaData?.totalPage}
                          page={page}
                          onChange={handlePageChange}
                          showFirstButton
                          showLastButton
                          onPageChange={handlePageChange}
                          rowsPerPageOptions={[10, 25, 50]}
                        />
                      </div>
                    )}
                  />
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrdersTableComponent
