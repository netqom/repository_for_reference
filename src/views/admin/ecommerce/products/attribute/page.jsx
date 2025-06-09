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
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
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

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import TableFilters from './TableFilters'
import { callCommonAction } from '@/redux-store/slices/common'
import { useDispatch, useSelector } from 'react-redux'
// import { useGetTeamMembers } from '@/app/server/team-members';
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import CircularLoader from '@/components/common/CircularLoader'
import { toast } from 'react-toastify'
import { deleteAttribute, getAttributesData, updateStatus } from '@/app/server/attribute'
import AttributeDialog from './AttributeDialog'

// Styled Components
const Icon = styled('i')({})

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
  const [value, setValue] = useState(initialValue ?? '')

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

  return <TextField {...props} value={value ?? ''} onChange={e => setValue(e.target.value)} size='small' />
}

// Vars

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

// Column Definitions
const columnHelper = createColumnHelper()

const AttributeList = () => {
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const dispatch = useDispatch()
  const commonReducer = useSelector(state => state.commonReducer)
  // Initialize data state properly with empty array
  const [data, setData] = useState([])
  const [editData, setEditData] = useState(null)
  const [filteredData, setFilteredData] = useState(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [search, setSearch] = useState('')
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false) // State for dialog
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalRecords, setTotalRecords] = useState(0)
  // Menu state
  const [selectedCatId, setSelectedCatId] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editIndex, setEditIndex] = useState(null)

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            {getAvatar({ avatar: row.original.avatar, fullName: row.original.name })}
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.name}
              </Typography>
              <Typography variant='body2'>{row.original.username}</Typography>
            </div>
          </div>
        )
      }),

      columnHelper.accessor('variations', {
        header: 'Variations',
        cell: ({ row }) => <Typography variant='body2'>{row.original.variations || '—'}</Typography>,
        meta: {
          width: 400
        }
      }),

      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={userStatusNameObj[row.original.status]}
            size='small'
            color={userStatusObj[row.original.status]}
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => {
          const currentStatus = row.original.status

          const handleStatusToggle = async () => {
            const newStatus = currentStatus === 1 ? 0 : 1
            const response = await updateStatus(row.original.id, 'status', { status: newStatus })
            refreshList()
          }

          return (
            <div className='flex items-center gap-2'>
              <IconButton onClick={() => handleDeleteConfirmation(row.original.id)}>
                <i className='ri-delete-bin-7-line text-textSecondary' />
              </IconButton>

              <IconButton onClick={() => handleEdit(row.original.id)}>
                <i className='ri-edit-line text-textSecondary' />
              </IconButton>

              <IconButton onClick={handleStatusToggle}>
                {currentStatus === 1 ? (
                  <i className='ri-eye-line text-textSecondary' title='Set Inactive' />
                ) : (
                  <i className='ri-eye-off-line text-textSecondary' title='Set Active' />
                )}
              </IconButton>
            </div>
          )
        },
        enableSorting: false,
         meta: {
          width: 200
        }
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
    fetchAttributes(page + 1, search, filteredData)
  }, [page, rowsPerPage, search, filteredData])

  const fetchAttributes = async (currentPage = 1, searchTerm = '') => {
    try {
      dispatch(callCommonAction({ loading: true }))
      const response = await getAttributesData(currentPage, rowsPerPage, searchTerm, filteredData)
      dispatch(callCommonAction({ loading: false }))
      if (response.statusCode === 200 && response.data) {
        const formatted = response?.data?.docs?.map(attribute => ({
          id: attribute._id,
          name: attribute.name,
          status: attribute.status,
          avatar: '',
          username: attribute.name.split(' ')[0],
          variations: attribute.variations
            .map(variation => `${variation.metaValue} ${variation.measurementUnit?.symbol || ''}`)
            .join(', ')
        }))

        setPage(page)
        setData(formatted)
        setTotalRecords(response.data.totalDocs || 0)
      }
    } catch (error) {
      dispatch(callCommonAction({ loading: false }))
      console.error('Failed to fetch product attribute', error)
    }
  }

  useEffect(() => {
    fetchAttributes()
  }, [])

  const handleChangePage = (event, newPage) => setPage(newPage)

  const handleChangeRowsPerPage = event => {
    table.setPageSize(parseInt(event.target.value))
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const getAvatar = params => {
    const { avatar, fullName } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(fullName)}
        </CustomAvatar>
      )
    }
  }

  // Handle Delete (show confirmation dialog)
  const handleDelete = async () => {
    try {
      const response = await deleteAttribute(selectedCatId)

      if (response.success) {
        // Remove the deleted user from the table
        refreshList()
      } else {
        toast.error(response.message || 'Failed to delete.')
      }
      setOpenConfirmDialog(false) // Close the dialog after deletion
    } catch (error) {
      console.error('Error deleting product attribute:', error)
      setOpenConfirmDialog(false) // Close the dialog on error as well
    }
  }

  // Handle Edit (open AddUserDrawer with current data)
  const handleEdit = id => {
    // const selectedData = data.find(result => result.id === id);
    setEditData(id)
    setDialogOpen(true)
    // setSelectedCatId(id);  // Store the selected member's ID
    // setAddUserOpen(true);  // Open the AddUserDrawer
  }
  // Handle Confirm Delete action
  const handleDeleteConfirmation = id => {
    setSelectedCatId(id)
    setOpenConfirmDialog(true)
  }

  // Handle Refresh List
  const refreshList = async () => {
    await fetchAttributes(page + 1, search, filteredData)
  }

  // Handle Close Model
  const handelClose = async () => {
    setAddUserOpen(!addUserOpen)
    refreshList()
    setEditData(null)
  }

  const handleAddClick = () => {
    setEditIndex(null)
    setDialogOpen(true)
  }

  return (
    <>
      {commonReducer?.loading && <CircularLoader />}
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Filters' />
            <TableFilters setFilters={setFilteredData} />
            <Divider />
            <div className='flex justify-between p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
              <div>
                {/* <Button
                color='secondary'
                variant='outlined'
                startIcon={<i className='ri-upload-2-line text-xl' />}
                className='max-sm:is-full'
              >Export</Button> */}
              </div>
              <div className='flex justify-between  items-center gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
                <DebouncedInput
                  value={globalFilter ?? ''}
                  onChange={value => setSearch(String(value))}
                  placeholder='Search by Name'
                  className='max-sm:is-full'
                />
                <Button variant='contained' onClick={handleAddClick} className='max-sm:is-full'>
                  <i className='ri-add-line text-xl' /> Add Attribute
                </Button>
              </div>
            </div>
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id} style={{ width: header.column.columnDef.meta?.width || 'auto' }}>
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
                                  asc: <i className='ri-arrow-up-s-line text-xl' />,
                                  desc: <i className='ri-arrow-down-s-line text-xl' />
                                }[header.column.getIsSorted()] ?? null}
                              </div>
                            </>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                {table.getFilteredRowModel().rows.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={table.getVisibleFlatColumns().length} className='text-center' style={{whiteSpace: 'normal'}}>
                        No data available
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {table
                      .getRowModel()
                      .rows.slice(0, table.getState().pagination.pageSize)
                      .map(row => {
                        return (
                          <tr key={row.id} className={classnames({ selected: row.getIsSelected() })} style={{whiteSpace: 'normal'}}>
                            {row.getVisibleCells().map(cell => (
                              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                          </tr>
                        )
                      })}
                  </tbody>
                )}
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
              <Typography>Are you sure you want to delete this product attribute?</Typography>
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

          <AttributeDialog
            open={dialogOpen}
            onClose={() => {
              setDialogOpen(false)
              setEditData(null)
            }}
            attributeId={editData}
            refreshList={refreshList}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default AttributeList
