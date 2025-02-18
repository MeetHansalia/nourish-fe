'use client'

// React Imports
import { useEffect, useState, useMemo, useRef } from 'react'

// NEXT Imports
import { useParams } from 'next/navigation'

// Third Party Imports
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
  TablePagination,
  IconButton,
  Tooltip
} from '@mui/material'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Arrow SVG
import ChevronRight from '@menu/svg/ChevronRight'

// Util Imports
import { API_ROUTER } from '@/utils/apiRoutes'
import { useTranslation } from '@/utils/getDictionaryClient'
import {
  toastError,
  actionConfirmWithLoaderAlert,
  successAlert,
  apiResponseErrorHandling
} from '@/utils/globalFunctions'
import axiosApiCall from '@utils/axiosApiCall'

// Core Component Imports
import CustomTextField from '@/@core/components/mui/TextField'
import DebouncedInput from '@/components/nourishubs/DebouncedInput'

/**
 * Page
 */
const SuspendedUsers = props => {
  // props
  const { dictionary = null } = props

  // Hooks
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)

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

  // useRef for aborting request
  const abortController = useRef(null)

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
      const response = await axiosApiCall.get(API_ROUTER.SUPER_ADMIN_USER.SUSPENDED_USERS, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter,
          orderBy: orderByString
        },
        signal: abortController.current.signal
      })

      const users = response?.data?.response?.users || []
      const meta = response?.data?.meta || {}

      setData(users)
      setTotalCount(meta.totalFiltered || 0)
      setTotalPages(meta.totalPage || 1)

      // if last page have 1 only user then this...
      if (users.length === 0 && page > 1) {
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

  // Activate User Call
  const handleActivateUser = userId => {
    // const sss = userId;
    // console.log('Activating user with ID:', sss);

    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for activating user
         */
        deleteUrl: `${API_ROUTER.SUPER_ADMIN_USER.PATCH_ACTIVE_USER(userId)}`,
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
      }
    )
  }

  // Delete User
  const handleDeleteUser = userId => {
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for deleting user
         */
        deleteUrl: `${API_ROUTER.SUPER_ADMIN_USER.SPECIFIC_USER_WITH_ID(userId)}`,
        requestMethodType: 'DELETE',
        title: `${dictionary?.sweet_alert?.user_delete?.title}`,
        text: `${dictionary?.sweet_alert?.user_delete?.text}`,
        customClass: {
          confirmButton: `btn bg-error`
        }
      },
      {
        confirmButtonText: `${dictionary?.sweet_alert?.user_delete?.confirm_button}`,
        cancelButtonText: `${dictionary?.sweet_alert?.user_delete?.cancel_button}`
      },
      (callbackStatus, result) => {
        /**
         * Callback after action confirmation
         */
        if (callbackStatus) {
          getAllSuspendedUsers()
          successAlert({
            title: `${dictionary?.sweet_alert?.user_delete?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.user_delete?.ok}`
          })
        }
      }
    )
  }

  const columnHelper = createColumnHelper()

  const columns = useMemo(
    () => [
      columnHelper.accessor('serialNumber', {
        header: `${dictionary?.datatable?.column?.serial_number}`,
        enableSorting: false
      }),
      columnHelper.accessor('first_name', {
        header: `${dictionary?.datatable?.column?.first_name}`
      }),
      columnHelper.accessor('last_name', {
        header: `${dictionary?.datatable?.column?.last_name}`
      }),
      columnHelper.accessor('email', {
        header: `${dictionary?.datatable?.column?.email}`
      }),
      columnHelper.accessor('phoneNo', {
        header: `${dictionary?.datatable?.column?.phone_no}`
      }),
      columnHelper.accessor('status', {
        header: `${dictionary?.datatable?.column?.status}`
      }),
      columnHelper.accessor('verificationStatus', {
        header: `${dictionary?.datatable?.column?.verification_status}`
      }),
      columnHelper.accessor('createdAt', {
        header: `${dictionary?.datatable?.column?.created_at}`,
        cell: info => new Date(info.getValue()).toLocaleDateString()
      }),
      // columnHelper.accessor('numberOfVenue', {
      //   header: `${dictionary?.datatable?.column?.number_of_venue}`
      // }),
      columnHelper.accessor('Actions', {
        header: `${dictionary?.datatable?.column?.actions}`,
        cell: ({ row }) => (
          <>
            <Tooltip title={''}>
              <IconButton onClick={() => handleActivateUser(row.original._id)}>
                <i className='tabler-user-check text-textSecondary' />
              </IconButton>
            </Tooltip>

            <IconButton onClick={() => handleDeleteUser(row.original._id)}>
              <i className='tabler-trash text-textSecondary' />
            </IconButton>
          </>
        ),
        enableSorting: false
      })
    ],
    [handleActivateUser]
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
    // getFilteredRowModel: getFilteredRowModel(),
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
    <Card>
      <CardHeader
        title={dictionary?.datatable?.suspended_user_table?.table_title}
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
                  // <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                  //   {flexRender(header.column.columnDef.header, header.getContext())}
                  //   {header.column.getIsSorted() === 'asc' ? (
                  //     <ChevronRight fontSize='1.25rem' className='-rotate-90' />
                  //   ) : header.column.getIsSorted() === 'desc' ? (
                  //     <ChevronRight fontSize='1.25rem' className='rotate-90' />
                  //   ) : null}
                  // </th>
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

export default SuspendedUsers
