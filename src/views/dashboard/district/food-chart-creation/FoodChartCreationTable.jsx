'use client'

// React Imports
import { useState, useEffect, useMemo, useRef } from 'react'

// Next Imports
import { useParams, usePathname } from 'next/navigation'

import { useSelector } from 'react-redux'

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
  IconButton,
  CardHeader
} from '@mui/material'

// Third-party Imports
import classnames from 'classnames'

// Utils Imports
import { isCancel } from 'axios'

import axiosApiCall from '@/utils/axiosApiCall'
import { useTranslation } from '@/utils/getDictionaryClient'
import {
  actionConfirmWithLoaderAlert,
  apiResponseErrorHandling,
  getPanelName,
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

// import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'
// import RequestViewDialogBox from './RequestViewDialogBox'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import Link from '@/components/Link'
import { getLocalizedUrl } from '@/utils/i18n'
import DebouncedInput from '@/components/nourishubs/DebouncedInput'

// Redux Imports
import { profileState } from '@/redux-store/slices/profile'
import StatusLabel from '@/components/theme/getStatusColours'

const FoodChartCreationTable = ({ dictionary }) => {
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  // const { t: t_aboutUs } = useTranslation(locale, 'about-us')
  const panelName = getPanelName(pathname)

  // States
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [recordMetaData, setRecordMetaData] = useState(null)
  const [page, setPage] = useState(1)
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [isDataTableServerLoading, setIsDataTableServerLoading] = useState(true)
  const { user = null } = useSelector(profileState)

  const abortController = useRef(null)

  // User Operation Permissions
  const userOperationPermissions = useMemo(
    () => ({
      create_foodchart: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'foodchart_management',
        subPermissionsToCheck: ['create_foodchart']
      }),
      approve_foodchart: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'foodchart_management',
        subPermissionsToCheck: ['approve_foodchart']
      }),
      get_foodchart_requests: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'foodchart_management',
        subPermissionsToCheck: ['get_foodchart_requests']
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

    const orderBy = sorting.reduce((acc, { id, desc }) => {
      acc[id] = desc ? -1 : 1

      return acc
    }, {})

    const orderByString = JSON.stringify(orderBy)

    setIsDataTableServerLoading(true)

    try {
      const response = await axiosApiCall.get(API_ROUTER.DISTRICT.GET_FOOD_CHART, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter,
          orderBy: orderByString
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

  const columnHelper = createColumnHelper()

  const columns = useMemo(() => {
    const cols = [
      columnHelper.accessor('serialNumber', {
        header: `${dictionary?.datatable?.column?.serial_number}`,
        cell: info => info.getValue(),
        size: 10,
        minSize: 10,
        enableSorting: false
      }),
      columnHelper.accessor('city', {
        header: `${dictionary?.datatable?.column?.city}`,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>,
        size: 10,
        minSize: 10
      }),
      columnHelper.accessor('address', {
        header: `${dictionary?.datatable?.column?.address}`,
        cell: info => <span>{info.getValue() || <span className='italic text-gray-500'>N/A</span>}</span>,
        size: 34,
        minSize: 20
      }),
      columnHelper.accessor('schoolName', {
        cell: ({ row }) => <span>{row?.original?.schoolName}</span>,
        size: 22,
        minSize: 20
      }),
      columnHelper.display({
        id: 'actions',
        header: `${dictionary?.datatable?.column?.view}`,
        cell: ({ row }) => {
          const { schoolAdminId, groupId } = row?.original

          return (
            <div className='flex gap-2' onClick={e => e.stopPropagation()}>
              <Link
                href={{
                  pathname: `/${locale}/${panelName}/vendor-selection-chart/food-chart-calendar`,
                  query: { schoolAdminId, groupId }
                }}
              >
                <IconButton>
                  <i className='tabler-eye' />
                </IconButton>
              </Link>
            </div>
          )
        },
        size: 10,
        minSize: 20,
        enableSorting: false
      }),
      columnHelper.accessor('Status', {
        header: `${dictionary?.datatable?.column?.status}`,
        enableSorting: false,
        cell: ({ row }) => {
          const orderStatus = row?.original?.status

          return <StatusLabel status={orderStatus} />
        }
      })
    ]

    // ✅ Add Actions column only if the user has permission
    if (userOperationPermissions.approve_foodchart) {
      cols.push(
        columnHelper.accessor('Actions', {
          header: `${dictionary?.datatable?.column?.actions}`,
          enableSorting: false,
          cell: ({ row }) => {
            return (
              <>
                {row?.original?.status === 'Pending' ? (
                  <Button
                    variant='contained'
                    onClick={() => {
                      handleStatusChange(row?.original?.schoolAdminId, row?.original?.groupId)
                    }}
                  >
                    {dictionary?.common?.approve}
                  </Button>
                ) : (
                  <Button variant='customLight' disabled>
                    {row?.original?.status}
                  </Button>
                )}
              </>
            )
          }
        })
      )
    }

    return cols
  }, [dictionary, data, userOperationPermissions])

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
      columnFilters,
      globalFilter,
      sorting
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    // getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true
    // defaultColumn: {
    //   size: 500,
    //   minSize: 10,
    //   maxSize: 100
    // }
  })

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  useEffect(() => {
    {userOperationPermissions?.get_foodchart_requests && getAllRequests()}

    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [page, itemsPerPage, globalFilter, sorting])

  const handleStatusChange = async (id, groupId) => {
    // Show confirmation popup
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for confirming status change to 'Approved'
         */
        deleteUrl: API_ROUTER.DISTRICT.APPROVE_FOOD_CHART_CREATION,
        requestMethodType: 'PATCH',
        title: `${dictionary?.sweet_alert?.foodchart_approve?.title}`,
        text: `${dictionary?.sweet_alert?.foodchart_approve?.text}`,
        customClass: {
          confirmButton: `btn bg-success`
        },
        requestInputData: {
          groupId: groupId,
          status: 'Approved'
        }
      },
      {
        confirmButtonText: `${dictionary?.sweet_alert?.foodchart_approve?.confirm_button}`,
        cancelButtonText: `${dictionary?.sweet_alert?.foodchart_approve?.cancel_button}`
      },
      (callbackStatus, result) => {
        /**
         * Callback after action confirmation
         */
        if (callbackStatus) {
          successAlert({
            title: `${dictionary?.sweet_alert?.foodchart_approve?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.foodchart_approve?.ok}`
          })
          setIsLoading(false)
          // router.back()
          getAllRequests()
        }
      }
    )
  }

  return (
    <>
      <Card className='common-block-dashboard table-block-no-pad'>
        {userOperationPermissions?.create_foodchart && (
          <CardHeader
            className='common-block-title'
            title={dictionary?.navigation?.food_chart_creation}
            action={
              <div className='flex max-sm:flex-col max-sm:is-full sm:items-center gap-4'>
                <Link href={getLocalizedUrl(`/${panelName}/vendor-selection-chart/new-food-chart-creation`, locale)}>
                  <Button variant='contained' className='theme-common-btn min-width-auto'>
                    {dictionary?.common?.food_chart_creation}
                  </Button>
                </Link>
                <div className='form-group'>
                  <DebouncedInput
                    value={globalFilter ?? ''}
                    onChange={value => setGlobalFilter(String(value))}
                    placeholder={dictionary?.datatable?.common?.search_placeholder}
                  />
                </div>
              </div>
            }
            // className='flex-wrap gap-4'
          />
        )}
        {userOperationPermissions?.get_foodchart_requests && (
          <>
            {/* <div className='overflow-x-auto'> */}
            <div className='overflow-x-auto table-common-block p-0'>
              <table className={tableStyles.table}>
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          style={{
                            width: `${header.column.columnDef.size}%`,
                            minWidth: `${header.column.columnDef.minSize}%`
                          }}
                        >
                          {header.isPlaceholder ? null : (
                            <>
                              <div
                                className={classnames({
                                  'flex items-center': header.column.getIsSorted(),
                                  'select-none cursor-pointer': header.column.getCanSort()
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
                            <td
                              key={cell.id}
                              style={{
                                width: `${cell.column.columnDef.size}%`,
                                minWidth: `${cell.column.columnDef.minSize}%`
                              }}
                              className='whitespace-normal break-words'
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
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

                  <Pagination
                    shape='rounded'
                    color='primary'
                    variant='tonal'
                    count={recordMetaData?.totalPage}
                    page={page}
                    onChange={handlePageChange}
                    showFirstButton
                    showLastButton
                  />
                </div>
              )}
            />
          </>
        )}
      </Card>
    </>
  )
}

export default FoodChartCreationTable
