'use client';

// React Imports
import { useEffect, useState, useMemo } from 'react';

// MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TablePagination from '@mui/material/TablePagination';
import Grid from '@mui/material/Grid2';
// Third-party Imports
import classnames from 'classnames';
import { rankItem } from '@tanstack/match-sorter-utils';
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
} from '@tanstack/react-table';

// Style Imports
import tableStyles from '@core/styles/table.module.css';
import {
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Stack,
  Switch
} from '@mui/material';
import TableFilters from './TableFilters';
import { useRouter, useParams } from 'next/navigation';
import CircularLoader from '@/components/common/CircularLoader';
import { toast } from 'react-toastify';

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  // States
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />;
};

// Column Definitions
const columnHelper = createColumnHelper();

const TradeProfessionalsList = ({ fetchList, deleteTeamMember, updateStatus }) => {
  // States
  const [rowSelection, setRowSelection] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize data state properly with empty array
  const [data, setData] = useState([]);

  const [filteredData, setFilteredData] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [search, setSearch] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // State for dialog
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  // Menu state
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const router = useRouter();

  const columns = useMemo(
    () => [
      columnHelper.accessor('_id', {
        header: 'User ID',
        cell: ({ row }) => <Typography>{row.original.userId}</Typography>
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => <Typography>{row.original.name || '-'}</Typography>
      }),
      columnHelper.accessor('phone', {
        header: 'Contact Information',
        cell: ({ row }) => <Typography>{row.original.phone || '-'}</Typography>
      }),
      columnHelper.accessor('email', {
        header: 'Email Address',
        cell: ({ row }) => <Typography>{row.original.email || '-'}</Typography>
      }),
      columnHelper.accessor('createdAt', {
        header: 'Registration Date',
        cell: ({ row }) => (
          <Typography>
            {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('lastLoginDate', {
        header: 'Last Login Date',
        cell: ({ row }) => (
          <Typography>
            {row.original.lastLoginDate ? new Date(row.original.lastLoginDate).toLocaleDateString() : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const userStatus = row.original.status;

          // If status is 4 (Rejected), show plain text instead of switch
          if (userStatus === 2) {
            return (
              <Chip label="Pending" color='info' size='small' variant='tonal' />
            );
          }
          if (userStatus === 4) {
            return (
              <Chip label="Rejected" color='error' size='small' variant='tonal' />
            );
          }

          // Render switch for other statuses (1 = Active, 0 = Inactive)
          return (
            <Stack alignItems='center'>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userStatus === 1 || userStatus === 3}
                      onChange={async event => {
                        const newStatus = event.target.checked ? 1 : 0;
                        const rowData = row.original;
                        await updateStatus(rowData._id, 'status', { status: newStatus });
                        refreshTradeProfessionalList();
                      }}
                    />
                  }
                  // label={userStatus === 1 ? 'Active' : 'Inactive'}
                  labelPlacement='end'
                  sx={{ m: 0 }}
                />
              </FormGroup>
            </Stack>
          );
        }
      }),

      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => router.push(`/admin/trade-professionals/view/${row.original._id}`)}>
              <i className='ri-eye-line text-textSecondary' />
            </IconButton>
            {/* <IconButton onClick={() => handleEdit(row.original._id)}>
          <i className='ri-edit-line text-textSecondary' />
        </IconButton>
        <IconButton onClick={() => handleDeleteConfirmation(row.original._id)}>
          <i className='ri-delete-bin-line text-textSecondary' />
        </IconButton> */}
          </div>
        ),
        enableSorting: false
      })
    ],
    [data]
  );

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
  });

  // Fetch members on page or rowsPerPage change
  useEffect(() => {
    if (!filteredData || filteredData.length === 0) return;
    const fetchData = async () => {
      setLoading(true);
      if (search || filteredData) {
        try {
          const data = await fetchList(page + 1, rowsPerPage, search, filteredData);
          // Update your state with the fetched data
          setData(data?.data?.docs ?? []);
          setTotalRecords(data?.data?.totalDocs);
          setPage(page);
          setRowsPerPage(rowsPerPage);
        } catch (error) {
          console.error('Failed to fetch data:', error);
        } finally {
          setLoading(false); // Stop loading
        }
      }
    };

    fetchData(); // Call the async function
  }, [page, rowsPerPage, search, filteredData]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = event => {
    table.setPageSize(parseInt(event.target.value));
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const { lang: locale } = useParams();

  // Handle Delete (show confirmation dialog)
  const handleDelete = async () => {
    try {
      const response = await deleteTeamMember(selectedMemberId);
      if (response.success) {
        refreshTradeProfessionalList();
      } else {
        toast.error(response.message || 'Failed to delete.');
      }
      setOpenConfirmDialog(false); // Close the dialog after deletion
    } catch (error) {
      console.error('Error deleting supplier:', error);
      setOpenConfirmDialog(false); // Close the dialog on error as well
    }
  };

  const refreshTradeProfessionalList = async () => {
    const updatedResult = await fetchList(page + 1, rowsPerPage, search, filteredData);
    setData(updatedResult?.data?.docs ?? []);
    setTotalRecords(updatedResult?.data?.totalDocs);
  };

  return (
    <>
      {loading && <CircularLoader />}
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Filters' />
            <TableFilters setFilters={setFilteredData} />
            <Divider />
            <div className='flex justify-end p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
              <div className='flex items-end gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
                <DebouncedInput
                  value={globalFilter ?? ''}
                  onChange={value => setSearch(String(value))}
                  placeholder='Search Trade Professionals'
                  className='max-sm:is-full'
                />
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
  );
};

export default TradeProfessionalsList;
