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
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'
import { callCommonAction } from '@/redux-store/slices/common'
// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import TeamListCards from './TeamListCards'
import AddUserDrawer from './AddTeamDrawer'
import TableFilters from './TableFilters'
import { useDispatch, useSelector } from 'react-redux'
import CircularLoader from '@/components/common/CircularLoader'
import { toast } from 'react-toastify'
// import { useGetTeamMembers } from '@/app/server/team-members';

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

const TeamMemberList = ({
  initialData,
  updateTeamMember,
  deleteTeamMember,
  getTeamMembersData,
  createTeamMember,
  updateStatus
}) => {
  // const { tableData, loading, error } = useGetTeamMembers()
  const dispatch = useDispatch()
  const commonReducer = useSelector(state => state.commonReducer)
  // States
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})

  // Initialize data state properly with empty array
  const [data, setData] = useState(initialData.members ?? [])
  const [editTeam, setEditTeam] = useState(null)

  const [filteredData, setFilteredData] = useState(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [search, setSearch] = useState('')
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false) // State for dialog
  const [page, setPage] = useState(initialData.page || 0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalRecords, setTotalRecords] = useState(initialData.totalRecords || 0)
  // Menu state
  const [selectedMemberId, setSelectedMemberId] = useState(null)

  const [statsData, setStatsData] = useState(initialData.statsData || [])

  const handleStatusToggle = async rowData => {
    const currentStatus = rowData.status
    const newStatus = currentStatus === 1 ? 0 : 1
    await updateStatus(rowData.id, newStatus)
    refreshTeamList()
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
      columnHelper.accessor('name', {
        header: 'User',
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
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => <Typography>{row.original.email}</Typography>
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ row }) => <Typography>{row.original.phone}</Typography>
      }),
      // columnHelper.accessor('role', {
      //   header: 'Role',
      //   cell: ({ row }) => (
      //     <div className='flex items-center gap-2'>
      //       <Icon className={userRoleObj[row.original.role]?.icon} sx={{ color: `var(--mui-palette-${userRoleObj[row.original.role]?.color}-main)`, fontSize: '1.375rem' }} />
      //       <Typography className='capitalize' color='text.primary'>
      //         {row.original.role}
      //       </Typography>
      //     </div>
      //   )
      // }),

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
          const currentStatus = row.original.status;
          return (
            <div className='flex items-center gap-2'>
              <IconButton onClick={() => handleDeleteConfirmation(row.original.id)}>
                <i className='ri-delete-bin-7-line text-textSecondary' />
              </IconButton>

              <IconButton onClick={() => handleEdit(row.original.id)}>
                <i className='ri-edit-line text-textSecondary' />
              </IconButton>

              <IconButton onClick={() => handleStatusToggle(row.original)}>
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



  useEffect(() => {
    // Define the async function inside the effect
    const fetchData = async () => {
      if (search || filteredData) {
        try {
          const data = await getTeamMembersData(page + 1, rowsPerPage, search, filteredData)
          // Update your state with the fetched data
          setData(data.members)
          setTotalRecords(data.totalRecords)
          setStatsData(data.statsData)
          setPage(data.page)
          setRowsPerPage(rowsPerPage)
        } catch (error) {
          console.error('Failed to fetch data:', error)
        }
      }
    }

    fetchData() // Call the async function
  }, [page, rowsPerPage, search, filteredData])

  const handleChangePage = (event, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = event => {
    table.setPageSize(parseInt(event.target.value))
    setRowsPerPage(parseInt(event.target.value))
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
      const response = await deleteTeamMember(selectedMemberId)
      if (response.success) {
        toast.success(response?.message)
        refreshTeamList()
      }
      setOpenConfirmDialog(false) // Close the dialog after deletion
    } catch (error) {
      console.error('Error deleting team member:', error)
      setOpenConfirmDialog(false) // Close the dialog on error as well
    }
  }

  // Handle Edit (open AddUserDrawer with current data)
  const handleEdit = id => {
    const member = data.find(user => user.id === id)
    setEditTeam(member)
    setSelectedMemberId(id) // Store the selected member's ID
    setAddUserOpen(true) // Open the AddUserDrawer
  }
  // Handle Confirm Delete action
  const handleDeleteConfirmation = id => {
    setSelectedMemberId(id)
    setOpenConfirmDialog(true)
  }

  const refreshTeamList = async () => {
    const updatedResult = await getTeamMembersData(page + 1, rowsPerPage)
    setData(updatedResult.members || [])
    setTotalRecords(updatedResult.totalRecords || 0)
  }
  const handelClose = async () => {
    setAddUserOpen(!addUserOpen)
    refreshTeamList()
    setEditTeam([])
  }


  return (
    <>
      {commonReducer?.loading && <CircularLoader />}
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <TeamListCards statsData={statsData} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Filters' />
            <TableFilters setFilters={setFilteredData} />
            <Divider />
            {/* <div className='flex justify-between p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>

          .
            <div className='flex items-center gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setSearch(String(value))}
                placeholder='Search User'
                className='max-sm:is-full'
              />
              <Button variant='contained' onClick={() => setAddUserOpen(!addUserOpen)}  className='max-sm:is-full flex items-center gap-2'
              >
              <i className='ri-add-line text-xl' />  Add Team Member
              </Button>
            </div>
          </div> */}
            <div className='flex justify-end p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
              <div className='flex items-center gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
                <DebouncedInput
                  value={globalFilter ?? ''}
                  onChange={value => setSearch(String(value))}
                  placeholder='Search User'
                  className='max-sm:is-full'
                />
                <Button
                  variant='contained'
                  onClick={() => setAddUserOpen(!addUserOpen)}
                  className='max-sm:is-full flex items-center gap-2'
                >
                  <i className='ri-add-line text-xl' /> Add Team Member
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
                      <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
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
                          <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
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

          <AddUserDrawer
            open={addUserOpen}
            handleClose={handelClose}
            editTeam={editTeam}
            updateTeamMember={updateTeamMember}
            createTeamMember={createTeamMember}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default TeamMemberList
