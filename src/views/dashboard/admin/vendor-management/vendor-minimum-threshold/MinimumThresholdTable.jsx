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
  TablePagination,
  IconButton
} from '@mui/material'

import { useSelector } from 'react-redux'

import { profileState } from '@/redux-store/slices/profile'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

import ChevronRight from '@menu/svg/ChevronRight'

// Util Imports
import { API_ROUTER } from '@/utils/apiRoutes'
import { useTranslation } from '@/utils/getDictionaryClient'
import { toastError, actionConfirmWithLoaderAlert, successAlert, isUserHasPermission } from '@/utils/globalFunctions'
import axiosApiCall from '@utils/axiosApiCall'
import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'

import ThresholdViewDialogBox from './ThresholdViewDialogBox'
import RejectViewDialogBox from './RejectViewDialogBox'
import CustomTextField from '@/@core/components/mui/TextField'
import DebouncedInput from '@/components/nourishubs/DebouncedInput'

const OrderDataTable = props => {
  //
  const { dictionary = null } = props
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const { user = null } = useSelector(profileState)
  const [page, setPage] = useState(1)
  const [data, setData] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [isDataTableServerLoading, setIsDataTableServerLoading] = useState(false)

  // useRef for aborting request
  const abortController = useRef(null)

  // Vars
  const isUserHasPermissionSections = useMemo(
    () => ({
      verify_user: isUserHasPermission({
        permissions: user?.permissions,
        permissionToCheck: 'user_management',
        subPermissionsToCheck: ['verify_user']
      })
    }),
    [user?.permissions]
  )

  // Fetch Data
  const getAllSuspendedUsers = async () => {
    // Abort the previous request if it's still pending
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
      const response = await axiosApiCall.get(API_ROUTER.ADMIN.GET_THRESHOLD_REQUESTS, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter,
          orderBy: orderByString
        },
        signal: abortController.current.signal
      })

      const vendorMinimumThresholds = response?.data?.response?.thresHoldRequests || []
      const meta = response?.data?.meta || {}

      setData(vendorMinimumThresholds)
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

  const columnHelper = createColumnHelper()

  const columns = useMemo(() => {
    const cols = [
      columnHelper.accessor('serialNumber', {
        header: `${dictionary?.datatable?.column?.serial_number}`,
        enableSorting: false
      }),
      columnHelper.accessor('vendorName', {
        header: `${dictionary?.datatable?.column?.vendor_name}`,
        cell: ({ row }) => {
          const firstName = row?.original?.first_name || 'N/A'
          const lastName = row?.original?.last_name || 'N/A'

          return (
            <span>
              {firstName} {lastName}
            </span>
          )
        }
      }),
      columnHelper.accessor('address', {
        header: `${dictionary?.datatable?.column?.address}`,
        cell: ({ row }) => {
          const address = row?.original?.address || 'N/A'

          return <span>{address}</span>
        }
      }),
      columnHelper.accessor('email', {
        header: `${dictionary?.datatable?.column?.contact}`
      }),
      columnHelper.accessor('createdAt', {
        header: `${dictionary?.datatable?.column?.created_at}`,
        cell: info => new Date(info.getValue()).toLocaleDateString()
      }),
      columnHelper.accessor('minThresHold', {
        header: `${dictionary?.datatable?.column?.number_of_venue}`
      })
    ]

    // ✅ Conditionally add "Actions" column if the user has permission
    if (isUserHasPermissionSections?.verify_user) {
      cols.push(
        columnHelper.accessor('Actions', {
          header: `${dictionary?.datatable?.column?.actions}`,
          cell: ({ row }) => (
            <div className='flex items-center gap-4'>
              <OpenDialogOnElementClick
                element={IconButton}
                elementProps={{
                  children: <i className='tabler-eye' />
                }}
                dialog={ThresholdViewDialogBox}
                dialogProps={{ dictionary, selectedRow: row.original, setData }}
              />
              <OpenDialogOnElementClick
                element={Button}
                elementProps={{
                  children: `${dictionary?.common?.reject}`,
                  variant: 'contained',
                  className: 'theme-common-btn'
                }}
                dialog={RejectViewDialogBox}
                dialogProps={{
                  selectedRow: row.original,
                  dictionary,
                  setData
                }}
              />
            </div>
          ),
          enableSorting: false
        })
      )
    }

    return cols
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
    getAllSuspendedUsers()

    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [page, itemsPerPage, globalFilter, sorting])

  return (
    <Card className='common-block-dashboard table-block-no-pad'>
      <CardHeader
        className='common-block-title'
        title={dictionary?.page?.order_management?.vendor_minimum_thresholds_verfication_requests}
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
                  <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
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
                {/* <td colSpan={columns?.length}> */}
                <td className='no-pad-td' colSpan={columns?.length}>
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

export default OrderDataTable
