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
  TablePagination
} from '@mui/material'

import ChevronRight from '@menu/svg/ChevronRight'

// Util Imports
import { API_ROUTER } from '@/utils/apiRoutes'
import { useTranslation } from '@/utils/getDictionaryClient'
import { toastError, actionConfirmWithLoaderAlert, successAlert } from '@/utils/globalFunctions'
import axiosApiCall from '@utils/axiosApiCall'
import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'

const OrderDataTable = props => {
  //
  const { dictionary = null } = props
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)

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

  const columnHelper = createColumnHelper()

  console.log('data', data)

  const columns = useMemo(
    () => [
      columnHelper.accessor('first_name', {
        header: `${dictionary?.datatable?.column?.first_name}`
      }),
      columnHelper.accessor('last_name', {
        header: `${dictionary?.datatable?.column?.last_name}`
      }),
      columnHelper.accessor('email', {
        header: `${dictionary?.datatable?.column?.email}`
      }),

      columnHelper.accessor('createdAt', {
        header: `${dictionary?.datatable?.column?.created_at}`,
        cell: info => new Date(info.getValue()).toLocaleDateString()
      }),
      columnHelper.accessor('minThresHold', {
        header: `${dictionary?.datatable?.column?.number_of_venue}`
      }),
      columnHelper.accessor('Actions', {
        header: `${dictionary?.datatable?.column?.actions}`,
        cell: ({ row }) => (
          <>
            <OpenDialogOnElementClick
              element={Button}
              elementProps={{
                children: <i className='tabler-eye' />
              }}
              // dialog={ThresholdViewDialogBox}
              dialogProps={{ dictionary, selectedRow: row.original, setData }}
            />
            <OpenDialogOnElementClick
              element={Button}
              elementProps={{
                children: `${dictionary?.common?.reject}`,
                variant: 'contained'
              }}
              // dialog={RejectViewDialogBox}
              dialogProps={{
                selectedRow: row.original,
                dictionary,
                setData
              }}
            />
          </>
        )
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
      columnFilters,
      globalFilter,
      sorting
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true
  })

  const handlePageChange = (_, newPage) => {
    setPage(newPage)
    table.setPageIndex(newPage - 1)
  }

  // useEffect(() => {
  //   getAllSuspendedUsers()

  //   return () => {
  //     if (abortController.current) {
  //       abortController.current.abort()
  //     }
  //   }
  // }, [page, itemsPerPage, globalFilter, sorting])

  return (
    <Card className='common-block-dashboard table-block-no-pad'>
      <CardHeader
        className='common-block-title'
        title={dictionary?.page?.order_management?.last_moment_cancle_orders}
        action={
          <TextField
            label={dictionary?.datatable?.common?.search_placeholder}
            variant='outlined'
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            fullWidth
            sx={{ maxWidth: 300 }}
          />
        }
      />
      <TableContainer className='table-common-block p-0' component={Paper}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell key={header.id} onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' ? (
                      <ChevronRight fontSize='1.25rem' className='-rotate-90' />
                    ) : header.column.getIsSorted() === 'desc' ? (
                      <ChevronRight fontSize='1.25rem' className='rotate-90' />
                    ) : null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {isDataTableServerLoading && (
              <tr>
                <td colSpan={columns?.length}>
                  <LinearProgress color='primary' sx={{ height: '2px' }} />
                </td>
              </tr>
            )}
          </TableHead>
          <TableBody>
            {/* {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))} */}
            {globalFilter.length > 0 && table.getFilteredRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={table.getVisibleFlatColumns().length} align='center'>
                  {t('datatable.common.no_matching_data_found')}
                </TableCell>
              </TableRow>
            ) : table.getFilteredRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={table.getVisibleFlatColumns().length} align='center'>
                  {t('datatable.common.no_data_available')}
                </TableCell>
              </TableRow>
            ) : (
              table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => (
                  <TableRow key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* <Stack direction='row' justifyContent='space-between' sx={{ padding: 2 }}> */}
      <TablePagination
        component={() => (
          <div className='common-pagination-block flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
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
