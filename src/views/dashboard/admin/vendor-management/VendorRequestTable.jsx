'use client'

// React Imports
import { useEffect, useState, useMemo, useRef } from 'react'

// NEXT Imports
import { useParams, useRouter } from 'next/navigation'

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

import { useSelector } from 'react-redux'

// MUI Imports
import {
  Card,
  CardHeader,
  Pagination,
  Typography,
  FormControl,
  Select,
  MenuItem,
  LinearProgress,
  TablePagination,
  IconButton
} from '@mui/material'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Util Imports
import { API_ROUTER } from '@/utils/apiRoutes'
import { useTranslation } from '@/utils/getDictionaryClient'
import { toastError, actionConfirmWithLoaderAlert, successAlert, isUserHasPermission } from '@/utils/globalFunctions'
import axiosApiCall from '@utils/axiosApiCall'
import Link from '@/components/Link'
import DebouncedInput from '@/components/nourishubs/DebouncedInput'

import { profileState } from '@/redux-store/slices/profile'
import StatusLabel from '@/components/theme/getStatusColours'

const VendorManagement = props => {
  const { dictionary = null } = props
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const router = useRouter()
  const { user = null } = useSelector(profileState)
  const [page, setPage] = useState(1)
  const [data, setData] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [recordMetaData, setRecordMetaData] = useState(null)
  const [isDataTableServerLoading, setIsDataTableServerLoading] = useState(false)

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

  // useRef for aborting request
  const abortController = useRef(null)

  const columnHelper = createColumnHelper()

  // Fetch Data
  const getAllVendors = async () => {
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
      const response = await axiosApiCall.get(API_ROUTER.ADMIN.GET_ALL_VENDOR, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter,
          orderBy: orderByString
        },
        signal: abortController.current.signal
      })

      const users = response?.data?.response?.vendors || []

      setData(users)
      // setTotalCount(meta.totalFiltered || 0)
      // setTotalPages(meta.totalPage || 1)

      const meta1 = response?.data?.meta || {}

      setRecordMetaData(meta1)

      // setVerificationRequestCount(response?.data?.response?.documentVerificationRequestsCount)

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

  const columns = useMemo(
    () => {
      const cols = [
        columnHelper.accessor('serialNumber', {
          header: `${dictionary?.datatable?.column?.serial_number}`,
          enableSorting: false
        }),
        columnHelper.accessor('first_name', {
          header: `${dictionary?.datatable?.column?.vendor_name}`,
          cell: ({ row }) => `${row?.original?.first_name ?? ''} ${row?.original?.last_name ?? ''}`
        }),
        columnHelper.accessor('companyName', {
          header: `${dictionary?.form?.label?.company_name}`,
          cell: ({ row }) => `${row?.original?.companyName ?? ''}`
        }),
        columnHelper.accessor('phoneNo', {
          header: `${dictionary?.datatable?.column?.contact}`
        }),
        columnHelper.accessor('status', {
          header: `${dictionary?.datatable?.column?.status}`,
          enableSorting: false,
          cell: ({ row }) => {
            const vendorStatus = row.original?.status

            return (
              <>
                <StatusLabel status={vendorStatus} />
              </>
            )
          }
        })
      ]

      // ✅ Conditionally add the "View Menu" column if the user has permission
      if (isUserHasPermissionSections?.verify_user) {
        cols.push(
          columnHelper.accessor('view', {
            header: `${dictionary?.datatable?.column?.view_details}`,
            cell: ({ row }) => (
              <Link href={`vendor-management/${row?.original?._id}`}>
                <IconButton onClick={() => router.push(`vendor-management/${row?.original?._id}`)}>
                  <i className='tabler-eye' />
                </IconButton>
              </Link>
            ),
            enableSorting: false
          })
        )
      }

      return cols
    },
    [isUserHasPermissionSections] // ✅ Add dependencies to useMemo
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
    manualPagination: true,
    manualSorting: true
  })

  const handlePageChange = (_, newPage) => {
    setPage(newPage)
    table.setPageIndex(newPage - 1)
  }

  useEffect(() => {
    getAllVendors()

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
        title={dictionary?.datatable?.vendor_management_table?.table_title}
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
          <tbody>
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
        <TablePagination
          component={() => (
            <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
              <Typography color='text.disabled'>
                {t('datatable.common.footer_showing_entries', {
                  startIndex: recordMetaData?.totalFiltered > 0 ? (page - 1) * itemsPerPage + 1 : 0,
                  endIndex:
                    recordMetaData?.totalFiltered > 0
                      ? Math.min(page * itemsPerPage, recordMetaData?.totalFiltered)
                      : 0,
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
                showFirstButton
                showLastButton
                count={recordMetaData?.totalPage}
                page={page}
                onChange={handlePageChange}
                shape='rounded'
                color='primary'
                variant='tonal'
              />
            </div>
          )}
        />
      </div>
    </Card>
  )
}

export default VendorManagement
