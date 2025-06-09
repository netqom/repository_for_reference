'use client';
// React Imports
import { useState, useEffect, useMemo } from 'react';

// Next Imports
import Link from 'next/link';
import { useParams } from 'next/navigation';

// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
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
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table';

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar';
import OptionMenu from '@core/components/option-menu';

// Util Imports
import { getInitials } from '@/utils/getInitials';
import { getLocalizedUrl } from '@/utils/i18n';

// Style Imports
import tableStyles from '@core/styles/table.module.css';
import { useDispatch } from 'react-redux';
import { callCommonAction } from '@/redux-store/slices/common';
import { getOrderList } from '@/app/server/order';
import { payoutProcess } from '@/app/server/trade-professional';
import moment from 'moment';
import { CardHeader, Grid2 } from '@mui/material';
import TableFilters from './TableFilters';
import { paymentStatus, statusChipColor } from '@/components/common/common';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid2';
import { toast } from 'react-toastify';

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => setValue(initialValue), [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce);
    return () => clearTimeout(timeout);
  }, [value]);

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />;
};

const columnHelper = createColumnHelper();

const OrderListTable = ({ orderData }) => {
  const dispatch = useDispatch();
  const { lang: locale } = useParams();
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status: '' });
  const NEXT_PUBLIC_BACKEND_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Input field value state
  const [payoutAmount, setPayoutAmount] = useState('');

  // Open dialog handler
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  // Close dialog handler
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setPayoutAmount(''); // Reset input on close
  };

  const calculateEligibleCommission = () => {
    const fourteenDaysAgo = moment().subtract(14, 'days');
    const eligibleOrders = data.filter(order => {
      const isShipped = order.orderStatus === 4;
      const isOldEnough = moment(order.updatedAt).isBefore(fourteenDaysAgo);
      return isShipped && isOldEnough;
    });

    return eligibleOrders.reduce((total, order) => total + parseFloat(order.commission), 0);
  };

  // Add state for eligible commission
  const [eligibleCommission, setEligibleCommission] = useState(0);

  // Update useEffect to calculate eligible commission when data changes
  useEffect(() => {
    const total = calculateEligibleCommission();
    setEligibleCommission(total);
  }, [data]);

  // Modify the handleSubmit function to validate payout amount
  const handleSubmit = () => {
    const amount = parseFloat(payoutAmount);
    if (amount <= 0) {
      // Show error message
      return;
    }
    if (amount > eligibleCommission) {
      // Show error message
      return;
    }
    // TODO: Call your API endpoint to process the payout
    processPayout(parseFloat(payoutAmount));
    handleCloseDialog();
  };


  // Add this function
  const processPayout = async (amount) => {
    try {
      dispatch(callCommonAction({ loading: true }));
      const response = await payoutProcess({ amount: parseFloat(amount) });
      console.log(response, 'responseresponseresponseresponse');
      dispatch(callCommonAction({ loading: false }));
      if (response.statusCode === 200 && response.data) {
        fetchOrderList(page, rowsPerPage);
        handleCloseDialog();
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
    }
  };



  useEffect(() => {
    fetchOrderList(page + 1, rowsPerPage);
  }, [page, rowsPerPage, search, filter]);

  const fetchOrderList = async (currentPage = 1, pageSize = rowsPerPage) => {
    try {
      dispatch(callCommonAction({ loading: true }));
      const response = await getOrderList(currentPage, pageSize, search, filter);
      // console.log(response, 'responseresponseresponseresponse')
      dispatch(callCommonAction({ loading: false }));

      if (response.statusCode === 200 && response.data) {
        const formatted = response.data.docs.map(order => ({
          id: order?._id,
          orderId: order?.orderId,
          createdAt: order?.createdAt,
          orderStatus: order?.orderStatus,
          commission: order?.commission,
          paymentStatus: order?.paymentStatus,
          sender: order?.sender,
          total: order?.total,
          order: order?.order,
          updatedAt: order?.updatedAt,
          avatar: order?.createdByDetails?.userImage,
          username: order?.createdByDetails?.name,
          email: order?.createdByDetails?.email,
          supportticketmsgs: order?.supportticketmsgs
        }));
        setData(formatted);
        setTotalRecords(response.data.totalDocs || 0);
      }
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
      console.error('Failed to fetch order list', error);
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

  const columns = useMemo(
    () => [
      columnHelper.accessor('orderNumber', {
        header: 'Order',
        cell: ({ row }) => (
          <Typography
            component={Link}
            href={getLocalizedUrl(`/trade-professional/orders/view/${row.original?.id}`, locale)}
            color='primary.main'
          >
            {`#${row.original.orderId}`}
          </Typography>
        )
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: ({ row }) => <Typography>{moment(row.original?.updatedAt).format('MMMM Do YYYY, h:mm:ss a')}</Typography>
      }),
      columnHelper.accessor('createdBy', {
        header: 'Customers',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getAvatar({
              avatar: `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/${row.original.avatar}`,
              customer: row.original?.username ?? ''
            })}
            <div className='flex flex-col'>
              <Typography>{row.original.username}</Typography>
              <Typography variant='body2'>{row.original.email}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('totalAmount', {
        header: 'Amount',
        cell: ({ row }) => <Typography>€{parseFloat(row.original?.total).toFixed(2)}</Typography>
      }),
      columnHelper.accessor('commission', {
        header: 'Commission',
        cell: ({ row }) => <Typography>€{parseFloat(row.original?.commission).toFixed(2)}</Typography>
      }),
      columnHelper.accessor('paymentStatus', {
        header: 'Payment',

        cell: ({ row }) => (
          <>
            <Chip
              label={paymentStatus[row.original.paymentStatus]?.text}
              color={paymentStatus[row.original.paymentStatus]?.color}
              variant='tonal'
              size='small'
            />
          </>
        )
      }),
      columnHelper.accessor('orderStatus', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={statusChipColor[row.original.orderStatus]?.text}
            color={statusChipColor[row.original.orderStatus]?.color}
            variant='tonal'
            size='small'
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-[22px]'
              options={[
                {
                  text: 'View',
                  icon: 'ri-eye-line',
                  href: getLocalizedUrl(`/trade-professional/orders/view/${row.original?.id}`, locale),
                  linkProps: { className: 'flex items-center is-full gap-2 plb-2 pli-4' }
                }
                // {
                //   text: 'Download Order Invoices',
                //   icon: 'ri-file-download-line',
                //   href: getLocalizedUrl(`/apps/ecommerce/orders/details/${row.original.order}`, locale),
                //   linkProps: { className: 'flex items-center is-full gap-2 plb-2 pli-4' }
                // },
                // {
                //   text: 'Delete',
                //   icon: 'ri-delete-bin-7-line text-[22px]',
                //   menuItemProps: {
                //     onClick: () => setData(data?.filter(order => order.id !== row.original.id)),
                //     className: 'flex items-center gap-2'
                //   }
                // }
              ]}
            />
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
    state: { rowSelection },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection
  });

  const getAvatar = ({ avatar, customer }) => {
    return avatar ? (
      <CustomAvatar src={avatar} skin='light' size={34} />
    ) : (
      <CustomAvatar skin='light' color='primary' size={34}>
        {getInitials(customer)}
      </CustomAvatar>
    );
  };

  return (
    <Card>
      <div className='flex items-center gap-2 justify-between'>
        <CardHeader title='Filters' />

        <div className='pe-4'>
          <DebouncedInput
            value={search}
            onChange={value => setSearch(value)}
            placeholder='Search Order'
            className='sm:is-auto'
          />
        </div>
      </div>

      <CardContent className='pt-0'>
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TableFilters setFilter={setFilter} filter={filter} className='w-full' />
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <div className='flex items-center gap-2 justify-end pt-2'>
              <div className='flex flex-col items-end'>
                <span>Total Commission: <strong>€{data.reduce((total, order) => total + parseFloat(order.commission), 0).toFixed(2)}</strong></span>
                <span>Eligible for Payout: <strong>€{eligibleCommission.toFixed(2)}</strong></span>
                <Typography variant='caption' color='textSecondary'>
                  (Only includes commissions from orders shipped 14+ days ago)
                </Typography>
              </div>
              <Button
                variant='contained'
                color='primary'
                startIcon={<i className="ri-wallet-2-fill"></i>}
                onClick={handleOpenDialog}
                disabled={eligibleCommission <= 0}
              >
                Payout
              </Button>
            </div>
          </Grid>
        </Grid>
      </CardContent>

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead className={tableStyles.thead}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className={tableStyles.tbody}>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
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

      {/* Update the Payout Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth='xs'>
        <DialogTitle>Request Commission Payout</DialogTitle>
        <DialogContent>
          <div className='mb-4 mt-2'>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              Available for payout: €{eligibleCommission.toFixed(2)}
            </Typography>
          </div>
          <TextField
            fullWidth
            label='Amount to Transfer'
            variant='outlined'
            value={payoutAmount}
            onChange={e => setPayoutAmount(e.target.value)}
            type='number'
            inputProps={{
              min: 0,
              max: eligibleCommission,
              step: '0.01'
            }}
            helperText={`Enter an amount between €0 and €${eligibleCommission.toFixed(2)}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant='contained'
            onClick={handleSubmit}
            disabled={!payoutAmount || parseFloat(payoutAmount) <= 0 || parseFloat(payoutAmount) > eligibleCommission}
          >
            Request Payout
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default OrderListTable;


