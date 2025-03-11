'use client'

// React Imports
import { useState, useEffect, useMemo, useRef } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

import { useDispatch, useSelector } from 'react-redux'

// React Table Imports
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender
} from '@tanstack/react-table'

// Mui Imports
import {
  Card,
  CardContent,
  LinearProgress,
  MenuItem,
  TablePagination,
  Typography,
  Pagination,
  Chip,
  Button,
  Grid,
  Link,
  CircularProgress,
  CardHeader,
  FormControl,
  Select
} from '@mui/material'

// Third-party Imports
import classnames from 'classnames'

// Utils Imports
import moment from 'moment'

import { isCancel } from 'axios'

import axiosApiCall from '@/utils/axiosApiCall'
import { useTranslation } from '@/utils/getDictionaryClient'
import {
  actionConfirmWithLoaderAlert,
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  successAlert,
  toastError,
  toastSuccess,
  isUserHasPermission
} from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'

// Component Imports
import CustomTextField from '@/@core/components/mui/TextField'

import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'
import RejectConfirmationDialogBox from './RejectConfirmationDialogBox'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { DEFAULT_ERROR_MESSAGE } from '@/utils/constants'
import CustomAvatar from '@/@core/components/mui/Avatar'
import NearByVendorDialog from './NearByVendorDialog'
import { numberFormat } from '@/utils/globalFilters'
import DebouncedInput from '@/components/nourishubs/DebouncedInput'
import { setOrderId } from '@/redux-store/slices/global'
import StatusLabel from '@/components/theme/getStatusColours'

import { profileState } from '@/redux-store/slices/profile'

const LastMomentOrderDataTable = ({ dictionary }) => {
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const dispatch = useDispatch()
  // const { t: t_aboutUs } = useTranslation(locale, 'about-us')

  // States
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [recordMetaData, setRecordMetaData] = useState(null)
  const [page, setPage] = useState(1)
  const [isDataTableServerLoading, setIsDataTableServerLoading] = useState(true)
  const [selectedRow, setSelectedRow] = useState(null)
  const { user = null } = useSelector(profileState)
  const [isLoading, setIsLoading] = useState(false)
  const [isNearVendorDialogShow, setIsNearVendorDialogShow] = useState(false)
  // const [isLastMomentCancalationCount, setLastMomentCancelationCount] = useState(false)

  const abortController = useRef(null)

  // Vars
  const isUserHasPermissionSections = useMemo(
    () => ({
      approve_last_movement_cancellation: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'order_management',
        subPermissionsToCheck: ['approve_last_movement_cancellation']
      })
    }),
    [user?.permissions]
  )

  // Fetch Data
  const getAllRequests = async () => {
    if (abortController.current) {
      abortController.current.abort()
    }

    // Create a new AbortController for the new request
    abortController.current = new AbortController()

    setIsDataTableServerLoading(true)

    try {
      const response = await axiosApiCall.get(API_ROUTER.AREA_EXECUTIVE.GET_ALL_CANCEL_ORDER, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter
          // orderBy: '{"_id" : "-1"}'
        },
        signal: abortController.current.signal
      })

      const users = response?.data?.response?.data || []
      const meta1 = response?.data?.meta || {}

      setRecordMetaData(meta1)

      setData(users)
      //   setTotalCount(meta1.totalFiltered || 0)

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

  // Approve Request
  const handleApprove = vendorData => {
    setIsLoading(true)
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for approving vendor
         */
        deleteUrl: API_ROUTER.ADMIN.APPROVE_REJECT_VENDOR_ORDER_REQUEST(vendorData?._id),
        requestMethodType: 'PATCH',
        title: `${dictionary?.sweet_alert?.order_approve?.title}`,
        text: `${dictionary?.sweet_alert?.order_approve?.text}`,
        customClass: {
          confirmButton: `btn bg-success`
        },
        requestInputData: {
          vendorId: vendorData?.vendorId?._id,
          cancelorderRequestRejectReason: '',
          isCancelRequestApproved: true
        }
      },
      {
        confirmButtonText: `${dictionary?.sweet_alert?.order_approve?.confirm_button}`,
        cancelButtonText: `${dictionary?.sweet_alert?.order_approve?.cancel_button}`
      },
      (callbackStatus, result) => {
        /**
         * Callback after action confirmation
         */
        if (callbackStatus) {
          successAlert({
            title: `${dictionary?.sweet_alert?.order_approve?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.order_approve?.ok}`
          })
          getAllRequests()
        }
      }
    )
  }

  // const response = await axiosApiCall.post(API_ROUTER.VENDOR.UPDATE_ORDER_STATUS, {
  //   id: schoolId, // Adjust based on your data structure
  //   action // "accept" or "reject"
  // })

  // toastSuccess(response.data.message)

  // Update the local data to reflect the action

  const columnHelper = createColumnHelper()

  const columns = useMemo(() => {
    const columnData = [
      columnHelper.accessor('serialNumber', {
        id: 'serialNumber',
        header: dictionary?.datatable?.column?.serial_number,
        cell: info => info.getValue(),
        enableSorting: false
      }),
      columnHelper.accessor(row => `${row.vendorId?.first_name ?? ''} ${row.vendorId?.last_name ?? ''}`.trim(), {
        id: 'vendorName',
        header: dictionary?.datatable?.column?.vendor_name,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>
      }),
      columnHelper.accessor('schoolId.schoolName', {
        id: 'schoolName',
        header: dictionary?.datatable?.column?.school_name,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>
      }),
      columnHelper.accessor(row => moment(row.deliveryDate).format('YYYY-MM-DD'), {
        id: 'deliveryDate',
        header: dictionary?.datatable?.column?.delivery_date,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>
      }),
      columnHelper.accessor('cancelOrderDescription', {
        id: 'cancellationReason',
        header: dictionary?.page?.vendor_management?.cancellation_reason,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>
      }),
      columnHelper.accessor('deliveryAddress', {
        id: 'vendorAddress',
        header: dictionary?.page?.vendor_management?.vendor_address,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>
      }),
      columnHelper.accessor('Status', {
        id: 'status',
        header: dictionary?.datatable?.column?.status,
        enableSorting: false,
        cell: ({ row }) => {
          const cancelOrderRequestStatus = row?.original?.cancelorderRequestStatus

          return (
            <div className='flex gap-2' onClick={e => e.stopPropagation()}>
              {cancelOrderRequestStatus !== 'reject' && (
                <>
                  <Button
                    variant='contained'
                    onClick={e => {
                      e.stopPropagation()
                      setSelectedRow(row?.original)

                      if (cancelOrderRequestStatus === 'initiate') {
                        handleApprove(row?.original)
                      } else if (cancelOrderRequestStatus === 'accepted') {
                        setIsNearVendorDialogShow(true)
                        dispatch(setOrderId(row?.original._id))
                      }
                    }}
                    className='theme-common-btn'
                  >
                    {cancelOrderRequestStatus === 'initiate' ? dictionary?.common?.approve : 'Reorder'}
                  </Button>

                  {cancelOrderRequestStatus === 'initiate' && (
                    <OpenDialogOnElementClick
                      element={Button}
                      elementProps={{
                        variant: 'outlined',
                        children: dictionary?.common?.reject,
                        onClick: e => e.stopPropagation(),
                        className: 'theme-common-btn'
                      }}
                      dialog={RejectConfirmationDialogBox}
                      dialogProps={{
                        getAllRequests,
                        dictionary,
                        page,
                        itemsPerPage,
                        vendorData: row?.original
                      }}
                    />
                  )}
                </>
              )}
            </div>
          )
        }
      })
    ]

    // ✅ Add Actions column only if the user has permission
    if (isUserHasPermissionSections?.approve_last_movement_cancellation) {
      columnData.push(
        columnHelper.display({
          id: 'actions',
          header: dictionary?.datatable?.column?.actions,
          cell: ({ row }) => {
            const cancelOrderRequestStatus = row?.original?.cancelorderRequestStatus

            return (
              <div className='flex gap-2' onClick={e => e.stopPropagation()}>
                {cancelOrderRequestStatus !== 'reject' && (
                  <>
                    <Button
                      variant='contained'
                      onClick={e => {
                        e.stopPropagation()
                        setSelectedRow(row?.original)

                        if (cancelOrderRequestStatus === 'initiate') {
                          handleApprove(row?.original)
                        } else if (cancelOrderRequestStatus === 'accepted') {
                          setIsNearVendorDialogShow(true)
                          dispatch(setOrderId(row?.original._id))
                        }
                      }}
                    >
                      {cancelOrderRequestStatus === 'initiate' ? dictionary?.common?.approve : 'Reorder'}
                    </Button>

                    {cancelOrderRequestStatus === 'initiate' && (
                      <OpenDialogOnElementClick
                        element={Button}
                        elementProps={{
                          variant: 'outlined',
                          children: dictionary?.common?.reject,
                          onClick: e => e.stopPropagation()
                        }}
                        dialog={RejectConfirmationDialogBox}
                        dialogProps={{
                          getAllRequests,
                          dictionary,
                          page,
                          itemsPerPage,
                          vendorData: row?.original
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            )
          }
        })
      )
    }

    return columnData
  }, [dictionary, isUserHasPermissionSections])

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
    // filterFns: {
    //   fuzzy: fuzzyFilter
    // },
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: itemsPerPage
      },
      // columnFilters,
      globalFilter
      // sorting
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true
  })

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  const handleCloseVendorDialog = () => {
    setIsNearVendorDialogShow(false)
  }

  useEffect(() => {
    getAllRequests()

    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [page, itemsPerPage, globalFilter])

  return (
    <>
      <Card className='common-block-dashboard table-block-no-pad'>
        <CardHeader
          className='common-block-title'
          title={dictionary?.page?.order_management?.last_moment_cancellation}
          action={
            <div className='form-group'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder={dictionary?.datatable?.common?.search_placeholder}
              />
            </div>
          }
        />
        {/* <div className='overflow-x-auto'> */}
        <div className='table-common-block p-0 overflow-x-auto'>
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
                  <td colSpan={columns?.length} className='no-pad-td'>
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
                shape='rounded'
                color='primary'
                variant='tonal'
                count={recordMetaData?.totalPage}
                page={page}
                onChange={handlePageChange}
                showFirstButton
                showLastButton
                //   onPageChange={handlePageChange}
                // rowsPerPageOptions={[10, 25, 50]}
              />
            </div>
          )}
        />
      </Card>
      <NearByVendorDialog
        isNearVendorDialogShow={isNearVendorDialogShow}
        handleCloseVendorDialog={handleCloseVendorDialog}
        orderId={selectedRow?._id}
      />
    </>
  )
}

export default LastMomentOrderDataTable
