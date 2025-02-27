'use client'
// React Imports
import { useEffect, useState, useMemo, useRef } from 'react'

// NEXT Imports
import { useParams } from 'next/navigation'

// Thirdparty Import
import classnames from 'classnames'
import { format } from 'date-fns'

// Table Imports
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender
} from '@tanstack/react-table'

// MUI Imports
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  LinearProgress,
  TablePagination,
  CardContent,
  Grid,
  InputLabel,
  TextField
} from '@mui/material'

// Arrow SVG
import { useSelector, useDispatch } from 'react-redux'

import ChevronRight from '@menu/svg/ChevronRight'

// Util Imports
import { API_ROUTER } from '@/utils/apiRoutes'
import { useTranslation } from '@/utils/getDictionaryClient'
import { toastError } from '@/utils/globalFunctions'
import axiosApiCall from '@utils/axiosApiCall'
import CustomTextField from '@/@core/components/mui/TextField'
import { globalState } from '@/redux-store/slices/global'
import ReviewDialog from './ReviewDialog'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { reviewDialogState, setIsRefreshReviewList } from '@/redux-store/slices/reviewDialog'
import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'
import tableStyles from '@core/styles/table.module.css'

const OrderReviewTable = props => {
  //** HOOKS */
  const { dictionary = null } = props
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const { loading: globalLoading, kidsData } = useSelector(globalState)

  //** STATES */
  const [page, setPage] = useState(1)
  const [data, setData] = useState([])
  const [sorting, setSorting] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [vendorList, setVendorList] = useState(null)
  const [selectedKid, setSelectedKid] = useState('all')
  const [selectedVendor, setSelectedVendor] = useState('all')
  const [isReviewed, setIsReviewed] = useState('all')
  const [orderDate, setOrderDate] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [globalFilter, setGlobalFilter] = useState('')

  //** REF */
  const abortController = useRef(null)

  //** REDUX DATA */
  const { isRefreshReviewList, isCompleteOrderApiCall } = useSelector(reviewDialogState)
  const dispatch = useDispatch()

  //** FETCH DATA */
  const getAllCompletedOrders = async () => {
    if (abortController.current) {
      abortController.current.abort()
    }

    abortController.current = new AbortController()

    const orderBy = sorting.reduce((acc, { id, desc }) => {
      acc[id] = desc ? -1 : 1

      return acc
    }, {})

    const orderByString = Object.keys(orderBy).length > 0 ? JSON.stringify(orderBy) : null

    setIsLoading(true)

    try {
      const response = await axiosApiCall.get(API_ROUTER.DISTRICT.REVIEW_LIST, {
        params: {
          page,
          limit: itemsPerPage,
          kidId: selectedKid === 'all' ? null : selectedKid,
          vendorId: selectedVendor === 'all' ? null : selectedVendor,
          orderDate: orderDate,
          orderBy: orderByString
        },
        signal: abortController.current.signal
      })

      const responseOrderList = response?.data?.response?.mealReviewList || []
      const meta = response?.data?.meta || {}

      setData(responseOrderList)
      setTotalCount(meta.totalFiltered || 0)
      setTotalPages(meta.totalPage || 1)

      if (responseOrderList.length === 0 && page > 1) {
        setPage(prevPage => prevPage - 1)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toastError(error?.response?.data?.message)
      }
    }

    setIsLoading(false)
  }

  const getVendorData = async () => {
    setIsLoading(true)

    try {
      const response = await axiosApiCall.get(API_ROUTER.DISTRICT.GET_VENDOR_LIST, {
        params: {
          page,
          searchQuery: globalFilter
        }
      })

      const responseVendor = response?.data?.response?.vendors || []

      setVendorList(responseVendor)
    } catch (error) {
      if (error.name !== 'AbortError') {
        toastError(error?.response?.data?.message)
      }
    }

    setIsLoading(false)
  }

  //** TABLE */
  const columnHelper = createColumnHelper()

  const columns = useMemo(
    () => [
      columnHelper.accessor('serialNumber', {
        header: `${dictionary?.datatable?.column?.sr_no}`
      }),

      columnHelper.accessor(row => `${row.orderId?.vendorId.first_name} ${row.orderId?.vendorId.last_name}`, {
        header: `${dictionary?.datatable?.column?.vendor_name}`
      }),
      columnHelper.accessor('orderId.orderType', {
        header: `${dictionary?.datatable?.column?.meal_type}`
      }),
      columnHelper.accessor('orderId.orderDate', {
        header: `${dictionary?.datatable?.column?.order_date}`
      }),
      columnHelper.accessor('meal_details', {
        header: `${dictionary?.datatable?.column?.meal_details}`,
        cell: info => {
          const order = info.row.original
          const mealDetails = order.orderId?.orderItems.map(item => item.dishId?.name).join(', ')

          return mealDetails
        }
      }),
      columnHelper.accessor('Actions', {
        header: `${dictionary?.datatable?.column?.status}`,
        enableSorting: false,
        cell: ({ row }) => {
          const orderStatus = row.original?.orderId?.orderStatus

          return (
            <>
              <OpenDialogOnElementClick
                element={Button}
                elementProps={{
                  children: `${orderStatus}`,
                  variant: 'contained'
                }}
                dialog={ReviewDialog}
                dialogProps={{ dictionary, selectedRow: row.original }}
              />
            </>
          )
        }
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
      sorting
    },
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

  //** EFFECTS */

  useEffect(() => {
    getAllCompletedOrders()
  }, [page, itemsPerPage, sorting, selectedKid, selectedVendor, orderDate])

  //** HANDLERS */

  const handelReviewModal = order => {
    if (order?.isReviewed) return
    setSelectedOrder(order)
  }

  const handelDateChange = date => {
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : null

    setOrderDate(formattedDate)
  }

  const updateOrderReviewStatus = orderId => {
    const updatedOrders = data.map(order => (order._id === orderId ? { ...order, isReviewed: true } : order))

    setData(updatedOrders)
    console.log('test update order')
    dispatch(setIsRefreshReviewList(null))
  }

  useEffect(() => {
    getVendorData()
    // getAllCompletedOrders()
  }, [])

  return (
    <>
      <Card>
        <CardContent className='flex flex-col gap-4'>
          <Grid container spacing={2} alignItems='center' justifyContent='space-between' sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <Typography variant='h5'>{dictionary?.datatable?.all_review?.table_title}</Typography>
            </Grid>
            <Grid item xs={12} md={8} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <TextField
                sx={{ minWidth: 150 }}
                value={selectedVendor}
                onChange={e => setSelectedVendor(e.target.value)}
                select
                label={dictionary?.page?.order_management?.select_vendor}
                size='small'
              >
                <MenuItem value={'all'}>{dictionary?.form?.label?.all}</MenuItem>
                {vendorList?.map(vendor => (
                  <MenuItem value={vendor?._id} key={vendor?._id}>
                    {`${vendor?.first_name} ${vendor?.last_name}`}
                  </MenuItem>
                ))}
              </TextField>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id='demo-controlled-open-select-label'>{dictionary?.form?.label?.select_child}</InputLabel>
                <Select
                  labelId='demo-controlled-open-select-label'
                  id='demo-controlled-open-select'
                  value={selectedKid}
                  label={dictionary?.form?.label?.select_child}
                  onChange={e => setSelectedKid(e.target.value)}
                  size='small'
                >
                  <MenuItem value={'all'}>{dictionary?.form?.label?.all}</MenuItem>
                  {kidsData?.map(kid => (
                    <MenuItem value={kid?._id} key={kid?._id}>
                      {`${kid?.first_name} ${kid?.last_name}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <AppReactDatepicker
                dateFormat='MM/dd/yyyy'
                selected={orderDate}
                onChange={date => handelDateChange(date)}
                maxDate={new Date()}
                customInput={<CustomTextField fullWidth />}
                placeholderText={t('form.placeholder.date')}
              />
            </Grid>
          </Grid>
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
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <i className='tabler-chevron-up text-xl' />,
                              desc: <i className='tabler-chevron-down text-xl' />
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
              {isLoading && (
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
      {selectedOrder?._id && (
        <ReviewDialog
          open={!!selectedOrder}
          handleClose={() => setSelectedOrder(null)}
          orderData={selectedOrder}
          updateOrderReviewStatus={updateOrderReviewStatus}
        />
      )}
    </>
  )
}

export default OrderReviewTable
