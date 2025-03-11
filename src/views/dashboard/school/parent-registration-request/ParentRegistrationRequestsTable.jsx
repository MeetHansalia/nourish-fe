'use client'

// React Imports
import { useState, useEffect, useMemo, useRef } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

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
  CardHeader
} from '@mui/material'

// Third-party Imports
import classnames from 'classnames'

// Utils Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { useTranslation } from '@/utils/getDictionaryClient'
import { actionConfirmWithLoaderAlert, successAlert, toastError } from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'

// Component Imports
import CustomTextField from '@/@core/components/mui/TextField'

import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'
import ProfileViewDialog from './RejectConfirmationDialogBox'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import DebouncedInput from '@/components/nourishubs/DebouncedInput'

const ParentRegistrationRequestsTable = ({ dictionary }) => {
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  // const { t: t_aboutUs } = useTranslation(locale, 'about-us')

  // States
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [recordMetaData, setRecordMetaData] = useState(null)
  const [page, setPage] = useState(1)
  const [isDataTableServerLoading, setIsDataTableServerLoading] = useState(true)

  const abortController = useRef(null)

  // Fetch Data
  const getAllRequests = async () => {
    if (abortController.current) {
      abortController.current.abort()
    }

    // Create a new AbortController for the new request
    abortController.current = new AbortController()

    setIsDataTableServerLoading(true)

    try {
      const response = await axiosApiCall.get(API_ROUTER.SCHOOL.GET_PARENT_REQUESTS, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter
          // orderBy: '{"_id" : "-1"}'
        },
        signal: abortController.current.signal
      })

      const users = response?.data?.response?.response || []
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
  const handleApproveRequest = (parentId, kidId) => {
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for approving request
         */
        deleteUrl: API_ROUTER.SCHOOL.POST_APPROVE_REJECT_PARENT_REQUESTS,
        requestMethodType: 'POST',
        title: `${dictionary?.sweet_alert?.user_approve?.title}`,
        text: `${dictionary?.sweet_alert?.user_approve?.text}`,
        customClass: {
          confirmButton: `btn bg-success`
        },
        requestInputData: {
          parentId,
          kidId,
          verificationStatus: 'approved', // Use 'approved' for the verification status
          rejectReason: null // Optionally, you can set rejectReason to null or omit it
        }
      },
      {
        confirmButtonText: `${dictionary?.sweet_alert?.user_approve?.confirm_button}`,
        cancelButtonText: `${dictionary?.sweet_alert?.user_approve?.cancel_button}`
      },
      (callbackStatus, result) => {
        /**
         * Callback after action confirmation
         */
        if (callbackStatus) {
          successAlert({
            title: `${dictionary?.sweet_alert?.user_approve?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.user_approve?.ok}`
          })

          // Optionally refresh the table data here
          getAllRequests(page, itemsPerPage)
        }
      }
    )
  }

  const columnHelper = createColumnHelper()

  const columns = useMemo(
    () => [
      columnHelper.accessor('serialNumber', {
        header: `${dictionary?.datatable?.column?.serial_number}`,
        cell: info => info.getValue()
      }),
      columnHelper.accessor('parentDetails.name', {
        header: `${dictionary?.datatable?.column?.parent_name}`,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>
      }),
      columnHelper.accessor('parentDetails.email', {
        header: `${dictionary?.datatable?.column?.email}`,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>
      }),
      columnHelper.accessor('kidName', {
        header: `${dictionary?.datatable?.column?.kid_name}`,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>
      }),
      columnHelper.accessor('requestDate', {
        header: `${dictionary?.datatable?.column?.request_date}`,
        cell: info => {
          const date = info.getValue()

          return date ? new Date(date).toLocaleString() : <span className='italic text-gray-500'>N/A</span>
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: `${dictionary?.datatable?.column?.actions}`,
        cell: ({ row }) => {
          const userId = row.original._id
          const parentId = row?.original?.parentDetails?._id
          const kidId = row?.original?._id

          return (
            <div className='flex gap-2' onClick={e => e.stopPropagation()}>
              <Button
                variant='contained'
                onClick={e => {
                  e.stopPropagation()
                  handleApproveRequest(row?.original?.parentDetails?._id, row?.original?._id, null)
                }}
                className='theme-common-btn'
              >
                {dictionary?.common?.approve}
              </Button>
              <OpenDialogOnElementClick
                element={Button}
                elementProps={{
                  variant: 'outlined',
                  children: dictionary?.common?.reject,
                  onClick: e => {
                    e.stopPropagation()
                  },
                  className: 'theme-common-btn-border'
                }}
                dialog={ProfileViewDialog}
                dialogProps={{
                  getAllRequests,
                  dictionary,
                  page,
                  itemsPerPage,
                  parentId,
                  kidId
                }}
              />
            </div>
          )
        }
      })
    ],
    [dictionary]
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
          title={dictionary?.datatable?.parent_approve_reject_table?.table_title}
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
              <div className='flex flex-col sm:flex-row items-center justify-between gap-4 is-full sm:is-auto'>
                <div className='flex items-center gap-2 is-full sm:is-auto'>
                  <Typography className='hidden sm:block'>{dictionary?.datatable?.common?.show}</Typography>
                  <CustomTextField
                    select
                    value={itemsPerPage}
                    onChange={e => setItemsPerPage(e.target.value)}
                    className='is-[70px] max-sm:is-full'
                  >
                    <MenuItem value={5}>05</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={15}>15</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                  </CustomTextField>
                </div>
              </div>

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
    </>
  )
}

export default ParentRegistrationRequestsTable
