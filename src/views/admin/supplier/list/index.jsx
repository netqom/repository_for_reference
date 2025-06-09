'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Grid from '@mui/material/Grid2'
// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { Chip, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import TableFilters from './TableFilters'
import { useRouter, useParams } from 'next/navigation'
import CircularLoader from '@/components/common/CircularLoader'

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

// Column Definitions
const columnHelper = createColumnHelper()

const SupplierMemberList = ({ initialData, fetchSupplierList, deleteTeamMember, updateStatus }) => {

  // States
  const [rowSelection, setRowSelection] = useState({})
  const [loading, setLoading] = useState(false)

  // Initialize data state properly with empty array
  const [data, setData] = useState(initialData?.data?.docs ?? [])

  const [filteredData, setFilteredData] = useState(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [search, setSearch] = useState('')
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false) // State for dialog
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalRecords, setTotalRecords] = useState(0)
  // Menu state
  const [selectedMemberId, setSelectedMemberId] = useState(null)

  const router = useRouter()

  const userStatusObj = {
    1: 'success',
    2: 'warning',
    0: 'secondary'
  }
  const userStatusNameObj = {
    1: 'Active',
    2: 'Pending',
    0: 'Inactive'
  }
  const handleSupplierStatusToggle = async rowData => {
    // console.log("rowDatarowData", rowData)
    const currentStatus = rowData.status
    const newStatus = currentStatus === 1 ? 0 : 1
    await updateStatus(rowData.id, newStatus)
    refreshSupplierList()
  }

  const columns = useMemo(
    () => [
      // {
      //   id: 'select',
      //   header: ({ table }) => (
      //     <Checkbox
      //       checked={table.getIsAllRowsSelected()}
      //       indeterminate={table.getIsSomeRowsSelected()}
      //       onChange={table.getToggleAllRowsSelectedHandler()}
      //     />
      //   ),
      //   cell: ({ row }) => (
      //     <Checkbox
      //       checked={row.getIsSelected()}
      //       disabled={!row.getCanSelect()}
      //       indeterminate={row.getIsSomeSelected()}
      //       onChange={row.getToggleSelectedHandler()}
      //     />
      //   )
      // },
      columnHelper.accessor('id', {
        header: 'Supplier ID',
        cell: ({ row }) => <Typography onClick={() => router.push(`/${locale}/admin/supplier/view/${row.original._id}`)} className="cursor-pointer">{row?.original?.supplierId}</Typography>
      }),
      columnHelper.accessor('companyName', {
        header: 'Company Name',
        cell: ({ row }) => <Typography onClick={() => router.push(`/${locale}/admin/supplier/view/${row.original._id}`)} className="cursor-pointer">{row?.original?.companyName}</Typography>
      }),

      columnHelper.accessor('email', {
        header: 'Company Email',
        cell: ({ row }) => <>{row?.original?.companyEmail ?? '-'}</>
      }),

      columnHelper.accessor('address', {
        header: 'Company Address',
        cell: ({ row }) => {
          const { addressLine1 } = row?.original?.addresses
          const fullAddress = [addressLine1].filter(Boolean).join(', ')
          return (
            <Typography>
              {fullAddress && `${fullAddress}, `}
              {row?.original?.city?.name && `${row?.original?.city?.name}, `}
              {row?.original?.state?.name && `${row?.original?.state?.name}, `}
              {row?.original?.country?.name && `${row?.original?.country?.name}`}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={userStatusNameObj[row.original.status] ?? 'Inactive'}
            size='small'
            color={userStatusObj[row.original.status] ?? 'secondary'}
            className='capitalize'
          />
        )
      }),
      // columnHelper.accessor('products', {
      //   header: 'Product Catalogs',
      //   cell: ({ row }) => (
      //     <Typography>{row.original.products?.map(product => product.name).join(', ') || '—'}</Typography>
      //   )
      // }),
      // columnHelper.accessor('discounts', {
      //   header: 'Client Discounts',
      //   cell: ({ row }) => (
      //     <>
      //       {row.original.discounts?.map((discount, index) => (
      //         <Typography key={index}>
      //           {discount.clientName}: {discount.percentage}%
      //         </Typography>
      //       )) || <Typography>—</Typography>}
      //     </>
      //   )
      // }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => {
          const currentStatus = row.original.status;
          return (
            <div className='flex items-center'>

              <IconButton onClick={() => handleDeleteConfirmation(row.original._id)}>
                <i className='ri-delete-bin-7-line text-textSecondary' />
              </IconButton>
              <IconButton onClick={() => handleEdit(row.original._id)}>
                <i className='ri-edit-line text-textSecondary' />
              </IconButton>
              <IconButton onClick={() => handleSupplierStatusToggle(row.original)}>
                {currentStatus === 1 ? (
                  <i className='ri-eye-line text-textSecondary' title='Set Inactive' />
                ) : (
                  <i className='ri-eye-off-line text-textSecondary' title='Set Active' />
                )}
              </IconButton>
            </div>
          )
        },
        enableSorting: false
      })
    ],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      globalFilter
    },
    filterFns: {
      fuzzy: fuzzyFilter
    },
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onRowSelectionChange: setRowSelection
  })

  // Fetch members on page or rowsPerPage change
  useEffect(() => {
    if (!filteredData || filteredData.length === 0) return
    const fetchData = async () => {
      setLoading(true)
      if (search || filteredData) {
        try {
          const data = await fetchSupplierList(page + 1, rowsPerPage, search, filteredData)
          // Update your state with the fetched data
          setData(data?.data?.docs ?? [])
          setTotalRecords(data?.data?.totalDocs)
          setPage(page)
          setRowsPerPage(rowsPerPage)
        } catch (error) {
          console.error('Failed to fetch data:', error)
        } finally {
          setLoading(false) // Stop loading
        }
      }
    }

    fetchData() // Call the async function
  }, [page, rowsPerPage, search, filteredData])

  const handleChangePage = (event, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = event => {
    table.setPageSize(parseInt(event.target.value))
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const { lang: locale } = useParams()

  // Handle Delete (show confirmation dialog)
  const handleDelete = async () => {
    try {
      const response = await deleteTeamMember(selectedMemberId)
      if (response.success) {
        refreshSupplierList()
      }
      setOpenConfirmDialog(false) // Close the dialog after deletion
    } catch (error) {
      console.error('Error deleting supplier:', error)
      setOpenConfirmDialog(false) // Close the dialog on error as well
    }
  }

  const handleEdit = id => {
    router.push(`/${locale}/admin/supplier/${id}`) // Adjust the path as per your routing
  }

  // Handle Confirm Delete action
  const handleDeleteConfirmation = id => {
    setSelectedMemberId(id)
    setOpenConfirmDialog(true)
  }

  const refreshSupplierList = async () => {
    const updatedResult = await fetchSupplierList(page + 1, rowsPerPage, search, filteredData)
    setData(updatedResult?.data?.docs ?? [])
    setTotalRecords(updatedResult?.data?.totalDocs)
  }

  return (
    <>
      {loading && <CircularLoader />}
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Filters' />
            <TableFilters setFilters={setFilteredData} />
            <Divider />
            {/* <div className='flex justify-between p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
           <Button
              color='secondary'
              variant='outlined'
              startIcon={<i className='ri-upload-2-line text-xl' />}
              className='max-sm:is-full'
            >
              Export
            </Button>
            <div className='flex items-end gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setSearch(String(value))}
                placeholder='Search Supplier'
                className='max-sm:is-full'
              />
              <Button
                variant='contained'
                onClick={() => router.push(`/${locale}/supplier/new`)}
                className='max-sm:is-full'
              >
                Add New Supplier
              </Button>
            </div>
          </div> */}
            <div className='flex justify-end p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
              <div className='flex items-end gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
                <DebouncedInput
                  value={globalFilter ?? ''}
                  onChange={value => setSearch(String(value))}
                  placeholder='Search Supplier'
                  className='max-sm:is-full'
                />
                <Button
                  variant='contained'
                  onClick={() => router.push(`/${locale}/admin/supplier/new`)}
                  className='max-sm:is-full'
                >
                  <i className='ri-add-line text-xl' /> Add Supplier
                </Button>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id}>
                          {!header.isPlaceholder && (
                            <div
                              className={classnames({
                                'flex items-center': header.column.getIsSorted(),
                                'cursor-pointer select-none': header.column.getCanSort()
                              })}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{
                                asc: <i className='ri-arrow-up-s-line text-xl' />,
                                desc: <i className='ri-arrow-down-s-line text-xl' />
                              }[header.column.getIsSorted()] ?? null}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {/* No Data Case */}
                  {!loading && table.getFilteredRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-4'>
                        No data available
                      </td>
                    </tr>
                  ) : (
                    <>
                      {/* Data Rows */}
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

                      {/* Loading Row */}
                      {loading && (
                        <tr>
                          <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-6'>
                            <CircularLoader size={32} />
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              component='div'
              count={totalRecords}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[1, 10, 20, 50]}
            />
          </Card>
          {/* Confirmation Dialog */}
          <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete this team member?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenConfirmDialog(false)} color='primary'>
                Cancel
              </Button>
              <Button onClick={handleDelete} color='secondary'>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Grid>
    </>
  )
}

export default SupplierMemberList
