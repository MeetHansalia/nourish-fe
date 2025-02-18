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
  FormControl,
  CardHeader
} from '@mui/material'

// Third-party Imports
import classnames from 'classnames'

// Utils Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { useTranslation } from '@/utils/getDictionaryClient'
import {
  actionConfirmWithLoaderAlert,
  apiResponseErrorHandling,
  isVariableAnObject,
  successAlert,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'

// Component Imports
import CustomTextField from '@/@core/components/mui/TextField'

import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'
import RejectConfirmationDialogBox from './RejectConfirmationDialogBox'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import ParentDetailDialogue from './ParentDetailDialogue'
import { DEFAULT_ERROR_MESSAGE } from '@/utils/constants'
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
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [isDataTableServerLoading, setIsDataTableServerLoading] = useState(true)
  const [openKidsDetailDialog, setOpenKidsDetailDialog] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const abortController = useRef(null)

  // Fetch Data
  const getAllRequests = async () => {
    if (abortController.current) {
      abortController.current.abort()
    }

    // Create a new AbortController for the new request
    abortController.current = new AbortController()

    setIsDataTableServerLoading(true)

    const orderBy = sorting.reduce((acc, { id, desc }) => {
      acc[id] = desc ? -1 : 1

      return acc
    }, {})

    const orderByString = JSON.stringify(orderBy)

    // console.log('orderByString', orderByString)

    try {
      const response = await axiosApiCall.get(API_ROUTER.DISTRICT.GET_PARENT_REGISTRATIN_KID, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter,
          orderBy: orderByString
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
  const onPressApprove = async () => {
    handleApproveRequest(selectedRow?.parentDetails?._id, selectedRow?._id, null)
  }

  const handleApproveRequest = async (parentId, kidId) => {
    setIsLoading(true)

    const params = {
      parentId,
      kidId,
      verificationStatus: 'approved',
      rejectReason: null
    }

    axiosApiCall({
      method: 'post',
      url: `${API_ROUTER.DISTRICT.UPDATE_KID_REGISTRATION_STATUS}`,
      data: params
    })
      .then(response => {
        const responseBody = response?.data

        if (response) {
          getAllRequests(page, itemsPerPage)
          toastSuccess(responseBody?.message)
          successAlert({
            title: `${dictionary?.sweet_alert?.school_approve?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.school_approve?.ok}`
          })
        }

        return response
      })
      .catch(error => {
        let errorMessage = ''
        const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

        if (!isVariableAnObject(apiResponseErrorHandlingData)) {
          errorMessage = apiResponseErrorHandlingData
        } else {
          errorMessage = error?.message || DEFAULT_ERROR_MESSAGE
        }
      })
      .finally(() => {
        handleCloseSchoolDetailDialog()
        setIsLoading(false)
      })
  }

  console.log(sorting, 'sorting')

  const columnHelper = createColumnHelper()

  const columns = useMemo(
    () => [
      columnHelper.accessor('serialNumber', {
        header: `${dictionary?.datatable?.column?.serial_number}`,
        cell: info => info.getValue(),
        enableSorting: false
      }),
      columnHelper.accessor('parentName', {
        header: `${dictionary?.datatable?.column?.parent_name}`,
        cell: ({ row }) => {
          const parentName = row?.original?.parentDetails?.name || 'N/A'

          return <span>{parentName}</span>
        }
      }),
      columnHelper.accessor('kidName', {
        header: `${dictionary?.datatable?.column?.kid_name}`,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>
      }),
      columnHelper.accessor('schoolName', {
        header: `${dictionary?.datatable?.column?.school_name}`,
        cell: ({ row }) => {
          const schoolName = row?.original?.schoolDetails?.schoolName || 'N/A'

          return <span>{schoolName}</span>
        }
      }),
      columnHelper.accessor('parentDetails.email', {
        header: `${dictionary?.datatable?.column?.email}`,
        cell: ({ row }) => {
          const email = row?.original?.parentDetails?.email || 'N/A'

          return <span>{email}</span>
        },
        id: 'parentDetails.email'
      }),
      columnHelper.accessor('parentDetails.phoneNo', {
        header: `${dictionary?.datatable?.column?.contact}`,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>,
        id: 'parentDetails.phoneNo'
      }),
      columnHelper.accessor('parentDetails.address', {
        header: `${dictionary?.datatable?.column?.address}`,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>
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

                  setOpenKidsDetailDialog(true)
                  setSelectedRow(row?.original)
                  //handleApproveRequest(row?.original?.parentDetails?._id, row?.original?._id, null)
                }}
              >
                {dictionary?.common?.approve}
              </Button>
              <OpenDialogOnElementClick
                element={Button}
                elementProps={{
                  variant: 'outlined',
                  children: `${dictionary?.common?.reject}`,
                  onClick: e => {
                    e.stopPropagation()
                  }
                }}
                dialog={RejectConfirmationDialogBox}
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
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),

    manualPagination: true,
    manualSorting: true
  })

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  const handleCloseSchoolDetailDialog = () => {
    setSelectedRow(null)
    setOpenKidsDetailDialog(false)
  }

  useEffect(() => {
    getAllRequests()

    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [page, itemsPerPage, globalFilter, sorting])

  return (
    <>
      <Card>
        <CardHeader
          title={dictionary?.datatable?.parent_approve_reject_table?.table_title}
          action={
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder={dictionary?.datatable?.common?.search_placeholder}
            />
          }
          className='flex-wrap gap-4'
        />
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
        {/* {recordMetaData?.total > 0 && ( */}
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
        {/* )} */}
      </Card>
      {openKidsDetailDialog && selectedRow && (
        <ParentDetailDialogue
          dictionary={dictionary}
          open={openKidsDetailDialog}
          onClose={handleCloseSchoolDetailDialog}
          data={selectedRow} // Pass dynamic data here
          onPressApprove={onPressApprove}
          isLoading={isLoading}
        />
      )}
    </>
  )
}

export default ParentRegistrationRequestsTable
