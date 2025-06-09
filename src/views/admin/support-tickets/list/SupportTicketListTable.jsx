'use client';

// React Imports
import { useEffect, useState, useMemo } from 'react';
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
import usePermission from '../../../../components/common/usePermission';

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

// Component Imports
import TableFilters from './TableFilters';
import AddSupportTicketDrawer from './AddSupportTicketDrawer';
import OptionMenu from '@core/components/option-menu';
import CustomAvatar from '@core/components/mui/Avatar';

// Util Imports
import { getInitials } from '@/utils/getInitials';
import { getLocalizedUrl } from '@/utils/i18n';

// Style Imports
import tableStyles from '@core/styles/table.module.css';

import { deleteSupportTicket, createSupportTicket, getSupportTicketList } from '@/app/server/support-ticket';
import { callCommonAction } from '@/redux-store/slices/common';
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import SupportTicketListCards from './SupportTicketListCards';
import Image from 'next/image';
import { Box, Tooltip } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import moment from 'moment';

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

const ticketStatusLabel = {
  1: 'Open',
  2: 'Closed',
  3: 'Pending',
  4: 'In Progress',
  5: 'Resolved',
  6: 'Rejected',
  7: 'Cancelled'
};

const ticketStatusObj = {
  1: 'secondary',
  2: 'default',
  3: 'info',
  4: 'primary',
  5: 'success',
  6: 'warning',
  7: 'error'
};

// Column Definitions
const columnHelper = createColumnHelper();

const SupportTicketListTable = () => {
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
  const [globalFilter, setGlobalFilter] = useState('');
  const [openConfirmation, setOpenConfirmation] = useState(false); // State for dialog
  const [selectedId, setSelectedId] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [editData, setEditData] = useState(null);
  const NEXT_PUBLIC_BACKEND_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

  const canAddSupportTicket = usePermission("create-support-ticket");
  const canUpdateSupportTicket = usePermission("update-support-ticket");
  const canDeleteSupportTicket = usePermission("delete-support-ticket");
  const canViewSupportTicket = usePermission("view-support-ticket");

  // Hooks
  const { lang: locale } = useParams();

  useEffect(() => {
    fetchSupportTickets(page + 1, rowsPerPage);
  }, [page, rowsPerPage, search, filter]);

  const fetchSupportTickets = async (currentPage = 1, pageSize = rowsPerPage) => {
    try {
      dispatch(callCommonAction({ loading: true }));
      const response = await getSupportTicketList(currentPage, pageSize, search, filter);
      dispatch(callCommonAction({ loading: false }));
      if (response.statusCode === 200 && response.data) {
        // Define mappings
        const ticketStatusObj = {
          open: 'secondary',
          in_progress: 'default',
          resolved: 'success',
          pending: 'warning',
          rejected: 'error'
        };

        const statusTitles = {
          open: 'Open Tickets',
          in_progress: 'In Progress Tickets',
          resolved: 'Resolved Tickets',
          pending: 'Pending Tickets',
          rejected: 'Rejected Tickets'
        };

        const statusIcons = {
          open: 'ri-user-follow-line',
          in_progress: 'ri-loader-4-line',
          resolved: 'ri-checkbox-circle-line',
          pending: 'ri-time-line',
          rejected: 'ri-close-line'
        };

        // Get response data
        const totalDocs = response?.data?.totalDocs || 0;
        const statusSummary = response?.data?.statusSummary || {};

        // Get percentage trend
        const getTrend = count => {
          const percentage = totalDocs ? ((count / totalDocs) * 100).toFixed(2) : 0;
          return {
            trendNumber: `${percentage}%`,
            trend: percentage >= 50 ? 'positive' : 'negative'
          };
        };

        // Build stats array dynamically
        const stats = [
          {
            title: 'All Tickets',
            stats: totalDocs.toString(),
            avatarIcon: 'ri-archive-line',
            avatarColor: 'info',
            trend: 'neutral',
            trendNumber: '100%'
          },
          ...Object.keys(ticketStatusObj).map(key => {
            const count = statusSummary[key] || 0;
            return {
              title: statusTitles[key],
              stats: count.toString(),
              avatarIcon: statusIcons[key],
              avatarColor: ticketStatusObj[key],
              ...getTrend(count)
            };
          })
        ];

        setStatsData(stats);
        const formatted = response?.data?.docs?.map(ticket => ({
          id: ticket?._id,
          ticketNumber: ticket?.ticketNumber,
          subject: ticket?.subject,
          message: ticket?.message,
          status: ticket?.status,
          sender_roles: ticket?.sender_roles?.map((el) => el?.name).join(', ') || 'Unknown',
          sender_name: ticket?.sender_detail?.map((el) => el?.name).join(', ') || '',
          order: ticket?.order,
          createdAt: ticket?.createdAt,
          updatedAt: ticket?.updatedAt,
          avatar: '',
          username: ticket?.subject,
          supportticketmsgs: ticket?.supportticketmsgs
        }));


        setPage(page);
        setData(formatted);
        setTotalRecords(response.data.totalDocs || 0);
      }
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
      console.error('Failed to fetch team members', error);
    }
  };

  const refreshList = async () => {
    await fetchSupportTickets();
  };

  const deleteMethod = async valueInBoolean => {
    if (valueInBoolean) {
      try {
        const response = await deleteSupportTicket(selectedId);
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
  const handleEdit = id => {
    const selectedData = data.find(result => result.id === id);
    setEditData(selectedData);
    setAddSupportTicketOpen(true);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('subject', {
        header: 'Subject',
        cell: ({ row }) => (
          <div onClick={() => router.push(getLocalizedUrl(`/admin/support-tickets/view/${row.original.id}`, locale))} className='flex cursor-pointer items-center gap-4'>
            {getAvatar({ avatar: row?.original?.avatar, subject: row?.original?.subject })}
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.subject}
              </Typography>
              <Typography variant='body2'>#{row?.original?.ticketNumber}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('message', {
        header: 'Description',
        cell: ({ row }) => (
          <Typography className='capitalize' color='text.primary'>
            {row.original?.message}
          </Typography>
        )
      }),
      columnHelper.accessor('sender_detail', {
        header: 'Customer Name',
        cell: ({ row }) => (
          //// console.log('row.originalrow.original', row)

          < Typography className='capitalize' color='text.primary' >
            {row.original?.sender_name}
          </Typography >
        )
      }),
      columnHelper.accessor('sender_role', {
        header: 'Customer Type',
        cell: ({ row }) => (
          <Typography className='capitalize' color='text.primary'>
            {row.original?.sender_roles}
          </Typography>
        )
      }),
      columnHelper.accessor('supportticketmsgs', {
        header: 'Document',
        cell: ({ row }) => {
          const filePath = row?.original?.supportticketmsgs?.filePath;
          const fileType = row?.original?.supportticketmsgs?.fileType;
          const fileURL = `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${filePath}`;

          return (
            <Box>
              {filePath ?
                fileType === 'image' ? (
                  <Tooltip title="View Doc">
                    <a href={fileURL} target='_blank' rel='noopener noreferrer'>
                      <Image
                        src={'/images/icons/image.png'}
                        width={24}
                        height={24}
                        alt='Support Ticket Attachment'
                        style={{ borderRadius: 4, objectFit: 'cover', cursor: 'pointer' }}
                      />
                    </a>
                  </Tooltip>
                ) : (
                  <Tooltip title="View Doc">
                    <a href={fileURL} target='_blank' rel='noopener noreferrer' >
                      <Image
                        src="/images/icons/black-pdf.png"
                        width={24}
                        height={24}
                        alt='Support Ticket Attachment'
                        style={{ borderRadius: 4, objectFit: 'cover', cursor: 'pointer' }}
                      />
                    </a>
                  </Tooltip>
                )
                : (
                  null
                )}
            </Box >
          );
        }
      }),

      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              label={ticketStatusLabel[row.original?.status]}
              size='small'
              color={ticketStatusObj[row.original?.status]}
              className='capitalize'
            />
          </div>
        )
      }),
      columnHelper.accessor('createdAt', {
              header: 'Requested Date & Time',
              cell: ({ row }) => <Typography>{moment(row.original?.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</Typography>
            }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            {canUpdateSupportTicket &&
                <IconButton onClick={() => handleEdit(row.original.id)}>
                  <i className='ri-edit-line text-textSecondary' />
                </IconButton>
            }
            {canDeleteSupportTicket &&
                <IconButton onClick={() => handleDeleteConfirmation(row.original.id)}>
                  <i className='ri-delete-bin-7-line text-textSecondary' />
                </IconButton>
            }
            {canViewSupportTicket &&
                <IconButton>
                  <Link href={getLocalizedUrl(`/admin/support-tickets/view/${row.original.id}`, locale)} className='flex'>
                    <i className='ri-eye-line text-textSecondary' />
                  </Link>
                </IconButton>
            }
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

  const getAvatar = params => {
    const { avatar, fullName } = params;

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />;
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(fullName)}
        </CustomAvatar>
      );
    }
  };

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SupportTicketListCards data={statsData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Filters' />
          <TableFilters setFilter={setFilter} filter={filter} />
          <Divider />
          <div className='flex justify-between p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
            <div></div>
            <div className='flex items-center gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
              <DebouncedInput
                value={search ?? ''}
                onChange={value => setSearch(String(value))}
                placeholder='Search Ticket'
                className='max-sm:is-full'
              />
              {canAddSupportTicket &&
                <Button
                  variant='contained'
                  onClick={() => setAddSupportTicketOpen(!addSupportTicketOpen)}
                  className='max-sm:is-full'
                >
                  Add Ticket
                </Button>
              }
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
        <AddSupportTicketDrawer
          open={addSupportTicketOpen}
          handleClose={() => {
            setAddSupportTicketOpen(!addSupportTicketOpen);
            setEditData(null);
          }}
          userData={data}
          setData={setData}
          refreshList={refreshList}
          editData={editData}
          setEditData={setEditData}
        />
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

export default SupportTicketListTable;
