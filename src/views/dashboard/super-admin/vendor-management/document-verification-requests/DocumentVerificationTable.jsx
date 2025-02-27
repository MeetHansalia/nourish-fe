'use client'

// React Imports
import { useEffect, useState, useMemo, useRef } from 'react'

// Next Imports
import { useParams, usePathname, useRouter } from 'next/navigation'

// Thirdparty Imports
import { isCancel } from 'axios'

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
  TextField,
  Paper,
  TablePagination,
  Typography,
  Select,
  MenuItem,
  FormControl,
  LinearProgress,
  Chip,
  Button,
  IconButton
} from '@mui/material'
import Pagination from '@mui/material/Pagination'

// React Table Imports
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender
} from '@tanstack/react-table'

// Style Imports
import classnames from 'classnames'

// Third-party Imports
import tableStyles from '@core/styles/table.module.css'

// Utils Imports
import {
  apiResponseErrorHandling,
  getPanelName,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError
  //   toastSuccess
} from '@/utils/globalFunctions'
import axiosApiCall from '@utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { useTranslation } from '@/utils/getDictionaryClient'
import Link from '@/components/Link'
import { getLocalizedUrl } from '@/utils/i18n'
import DebouncedInput from '@/components/nourishubs/DebouncedInput'
import CustomTextField from '@/@core/components/mui/TextField'

// Third-party Imports

const DocumentVerificationTable = ({ dictionary }) => {
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)

  const pathname = usePathname()

  // Vars
  const panelName = getPanelName(pathname)

  // States
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [recordMetaData, setRecordMetaData] = useState(null)
  const [isDataTableServerLoading, setIsDataTableServerLoading] = useState(true)

  const abortController = useRef(null)

  const columnHelper = createColumnHelper()

  const columns = useMemo(
    () => [
      columnHelper.accessor('serialNumber', {
        header: `${dictionary?.datatable?.column?.serial_number}`,
        cell: info => info.getValue(),
        enableSorting: false
      }),
      columnHelper.accessor('vendorName', {
        header: `${dictionary?.datatable?.column?.vendor_name}`,
        cell: ({ row }) => {
          return <span>{row?.original?.vendorName}</span>
        }
      }),
      columnHelper.accessor('address', {
        header: `${dictionary?.datatable?.column?.country_name}`,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>
      }),

      columnHelper.accessor('viewDetails', {
        header: dictionary?.datatable?.column?.view_menu,
        cell: ({ row }) => (
          <Link
            href={getLocalizedUrl(
              `${panelName}/vendor-management/document-verification-requests/${row?.original?._id}`,
              locale
            )}
            className='flex'
          >
            <IconButton>
              <i className='tabler-eye text-textSecondary' />
            </IconButton>
          </Link>
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
      globalFilter,
      sorting
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true
  })

  //  Get Document verification requests api call
  const getDocumentData = async () => {
    if (abortController.current) {
      abortController.current.abort()
    }

    setIsLoading(true)
    // Create a new AbortController for the new request
    abortController.current = new AbortController()

    const orderBy = sorting.reduce((acc, { id, desc }) => {
      acc[id] = desc ? -1 : 1

      return acc
    }, {})

    const orderByString = JSON.stringify(orderBy)

    setIsDataTableServerLoading(true)

    await axiosApiCall
      .get(API_ROUTER.SUPER_ADMIN_VENDOR.DOCUMENTS_LIST_FOR_VERIFICATION, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter,
          orderBy: orderByString
        },
        signal: abortController.current.signal
      })
      .then(response => {
        setData(response?.data?.response?.documentsVerificationRequests)
        const metaDataFromResponse = response?.data?.meta || {}

        setRecordMetaData(metaDataFromResponse)
        setIsLoading(false)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            setFormFieldsErrors(apiResponseErrorHandlingData, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
          }
        }
      })
      .finally(() => {
        setIsDataTableServerLoading(false)
      })
  }

  const handlePageChange = (_, newPage) => {
    setPage(newPage)
  }

  const handleItemsPerPageChange = event => {
    setItemsPerPage(event.target.value)
    setPage(1)
  }

  /*
    Page Life Cycle Starts
 */
  useEffect(() => {
    getDocumentData()

    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [page, itemsPerPage, globalFilter, sorting])
  /*
    Page Life Cycle Ends
 */

  return (
    <Card className='common-block-dashboard table-block-no-pad'>
      <CardHeader
        title={dictionary?.datatable?.verification_request_Table?.table_title}
        action={
          <div className='form-group'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder={dictionary?.datatable?.common?.search_placeholder}
            />
          </div>
        }
        className='flex-wrap gap-4 common-block-title'
      />
      <div className='table-common-block overflow-x-auto'>
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
                            'select-none cursor-pointer ': header.column.getCanSort()
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
    </Card>
  )
}

export default DocumentVerificationTable
