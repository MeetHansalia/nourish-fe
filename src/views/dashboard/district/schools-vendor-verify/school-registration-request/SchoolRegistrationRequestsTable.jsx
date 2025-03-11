'use client'

// React Imports
import { useState, useEffect, useMemo, useRef } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// React Table Imports
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  // getFilteredRowModel,
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
  Box,
  IconButton,
  FormControl,
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

// import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import Link from '@/components/Link'
import { getLocalizedUrl } from '@/utils/i18n'
import DebouncedInput from '@/components/nourishubs/DebouncedInput'

const SchoolRegistrationRequestsTable = ({ dictionary }) => {
  const { lang: locale } = useParams()
  const router = useRouter()

  const { t } = useTranslation(locale)
  // const { t: t_aboutUs } = useTranslation(locale, 'about-us')

  // States
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [recordMetaData, setRecordMetaData] = useState(null)
  const [page, setPage] = useState(1)
  const [columnFilters, setColumnFilters] = useState([])
  const [sorting, setSorting] = useState([])
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

    const orderBy = sorting.reduce((acc, { id, desc }) => {
      acc[id] = desc ? -1 : 1

      return acc
    }, {})

    const orderByString = JSON.stringify(orderBy)

    try {
      const response = await axiosApiCall.get(API_ROUTER.DISTRICT.GET_SCHOOL_REGISTRATION_REQUESTS, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter,
          orderBy: orderByString
        },
        signal: abortController.current.signal
      })

      const users = response?.data?.response?.documentsVerificationRequests || []
      const meta1 = response?.data?.meta || {}

      setRecordMetaData(meta1)

      setData(users)

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

  const columnHelper = createColumnHelper()

  const columns = useMemo(
    () => [
      columnHelper.accessor('serialNumber', {
        header: `${dictionary?.datatable?.column?.serial_number}`,
        cell: info => info.getValue(),
        enableSorting: false
      }),
      columnHelper.accessor('schoolName', {
        header: `${dictionary?.datatable?.column?.school_name}`,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>
      }),
      columnHelper.accessor('address', {
        header: `${dictionary?.datatable?.column?.country_name}`,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>
      }),

      columnHelper.accessor('viewDetails', {
        header: dictionary?.datatable?.column?.view,
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton>
              <Link
                href={getLocalizedUrl(
                  `/district/schools-vendors-verify/school-registration-request/${row?.original?._id}`,
                  locale
                )}
                className='flex'
              >
                <i className='tabler-eye text-textSecondary' />
              </Link>
            </IconButton>
          </div>
        ),
        enableSorting: false
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
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
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
  }, [page, itemsPerPage, globalFilter, sorting])

  return (
    <>
      <Card className='common-block-dashboard table-block-no-pad'>
        <CardHeader
          className='common-block-title'
          title={dictionary?.datatable?.school_approve_reject_table?.table_title}
          action={
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder={dictionary?.datatable?.common?.search_placeholder}
            />
          }
          // className='flex-wrap gap-4'
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
                  <td className='no-pad-td' colSpan={columns?.length}>
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
              />
            </div>
          )}
        />
      </Card>
    </>
  )
}

export default SchoolRegistrationRequestsTable
