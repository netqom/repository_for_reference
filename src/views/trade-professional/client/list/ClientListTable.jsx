'use client';

// React Imports
import { useEffect, useState, useMemo, useRef } from 'react';
import Grid from '@mui/material/Grid2';
// Next Imports
import Link from 'next/link';

// MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import TablePagination from '@mui/material/TablePagination';

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

import CustomAvatar from '@core/components/mui/Avatar';

// Util Imports
import { getInitials } from '@/utils/getInitials';
import { getLocalizedUrl } from '@/utils/i18n';

// Style Imports
import tableStyles from '@core/styles/table.module.css';

import { deleteTradeProfessionalClient, getTradeProfessionalClientList } from '@/app/server/trade-professional';
import { callCommonAction } from '@/redux-store/slices/common';
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { Box, Tooltip } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import moment from 'moment';
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick';
import EditClientInfo from './editClientInfo';

// Styled Components
const Icon = styled('i')({});

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

const ticketStatusLabel = { // 1 = Active, 0 = Inactive, 2 = Pending
  1: 'Active',
  2: 'Inactive',
  3: 'Pending',
};

const ticketStatusObj = {
  1: 'success',
  2: 'warning',
  3: 'error',
};

// Column Definitions
const columnHelper = createColumnHelper();

const ClientListTable = () => {
  // Hooks
  const router = useRouter();
  const dispatch = useDispatch();
  const [addSupportTicketOpen, setAddSupportTicketOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status: '' });
  const [openConfirmation, setOpenConfirmation] = useState(false); // State for dialog
  const [selectedId, setSelectedId] = useState(null);
  const [editData, setEditData] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const buttonProps = (children, color, variant) => ({ children, color, variant });

  // Hooks
  const { lang: locale } = useParams();

  useEffect(() => {
    fetchClients(page + 1, rowsPerPage);
  }, [page, rowsPerPage, search, filter]);

  useEffect(() => {
    if (refresh) {
      refreshList();
      setRefresh(false);
    }
  }, [refresh]);

  const fetchClients = async (currentPage = 1, pageSize = rowsPerPage) => {
    try {
      dispatch(callCommonAction({ loading: true }));
      const response = await getTradeProfessionalClientList(currentPage, pageSize, search, filter);
      dispatch(callCommonAction({ loading: false }));
      if (response.statusCode === 200 && response.data) {
        const formatted = response?.data?.docs?.map(user => ({
          id: user?._id,
          userId: user?.userId,
          name: user?.name,
          email: user?.email,
          role: 'Client',
          phone: user?.phone,
          addressDetail: user?.addressDetails,
          address: user?.addressDetails
            ? `${user.addressDetails.addressLine1 || ''}, ${user.addressDetails.street || ''}, ${user.addressDetails.city || ''}, ${user.addressDetails.state || ''}, ${user.addressDetails.postalCode || ''}, ${user.addressDetails.country || ''}`
            : 'N/A',
          //status: user?.status,
          avatar: user?.userImage,
          createdBy: user?.createdBy,
          updatedBy: user?.updatedBy,
          createdAt: user?.createdAt,
          updatedAt: user?.updatedAt
        }));

        setPage(page);
        setData(formatted);
        setTotalRecords(response.data.totalDocs || 0);
      }
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
    }
  };

  const refreshList = async () => {
    await fetchClients();
  };

  const deleteMethod = async valueInBoolean => {
    if (valueInBoolean) {
      try {
        const response = await deleteTradeProfessionalClient(selectedId);
        if (response?.statusCode === 200) {
          toast.success(response?.message);
          refreshList();
        }
      } catch (error) {
        setOpenConfirmation(false); // Close the dialog on error as well
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
    setPage(0);
  };

  const handleDeleteConfirmation = id => {
    setSelectedId(id);
    setOpenConfirmation(true);
  };

  // Handle Edit (open AddUserDrawer with current data)

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => (
          <div className='flex cursor-pointer items-center gap-4'>
            {/* {getAvatar({ avatar: row?.original?.avatar, subject: row?.original?.name })} */}
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row?.original?.name}
              </Typography>
              {/* <Typography variant='body2'>#{row?.original?.userId}</Typography> */}
            </div>
          </div>
        )
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => (
          <Typography className='capitalize' color='text.primary'>
            {row.original?.email}
          </Typography>
        )
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ row }) => (
          <Typography className='capitalize' color='text.primary'>
            {row?.original?.phone}
          </Typography>
        )
      }),
      columnHelper.accessor('address', {
        header: 'Address',
        cell: ({ row }) => (
          <Tooltip title={row.original?.address}>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {row.original?.address}
            </Typography>
          </Tooltip>
        )
      }),
      columnHelper.accessor('role', {
        header: 'Customer Type',
        cell: ({ row }) => (
          <Typography className='capitalize' color='text.primary'>
            {row?.original?.role}
          </Typography>
        )
      }),

      // columnHelper.accessor('status', {
      //   header: 'Status',
      //   cell: ({ row }) => (
      //     <div className='flex items-center gap-3'>
      //       <Chip
      //         variant='tonal'
      //         label={ticketStatusLabel[row.original?.status]}
      //         size='small'
      //         color={ticketStatusObj[row.original?.status]}
      //         className='capitalize'
      //       />
      //     </div>
      //   )
      // }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <span onClick={() => setEditData(row.original)}>
              <OpenDialogOnElementClick
                element={IconButton}
                elementProps={{
                  children: <i className='ri-edit-line' />,
                  size: 'small',
                  'aria-label': 'edit customer'
                }}
                dialog={EditClientInfo}
                dialogProps={{ data: row.original, setRefresh }}
              />
            </span>

            <IconButton onClick={() => handleDeleteConfirmation(row.original.id)}>
              <i className='ri-delete-bin-7-line text-textSecondary' />
            </IconButton>

            <IconButton 
              onClick={() => window.open('/en/products', '_blank')}
              title="Place Order"
            >
              <i className='ri-shopping-cart-line text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection
  });


  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}></Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='My Clients' />
          <Divider />
          <div className='flex justify-between p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
            <div></div>
            <div className='flex items-center gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
              <DebouncedInput
                value={search ?? ''}
                onChange={value => setSearch(String(value))}
                placeholder='Search Client'
                className='max-sm:is-full'
              />
              <OpenDialogOnElementClick
                element={Button}
                elementProps={buttonProps('Add Client', 'primary', 'contained')}
                dialog={EditClientInfo}
                dialogProps={{ data: null, setRefresh }}
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
                      );
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

        <ConfirmationDialog
          open={openConfirmation}
          setOpen={setOpenConfirmation}
          type='delete-record'
          callbackMethod={deleteMethod}
        />
      </Grid>
    </Grid>
  );
};

export default ClientListTable;
