'use client';

// React Imports
import { useState, useEffect, useMemo } from 'react';

// Next Imports
import Link from 'next/link';
import { useParams } from 'next/navigation';

// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import TablePagination from '@mui/material/TablePagination';
import Image from 'next/image';
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
import OptionMenu from '@core/components/option-menu';

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n';
import Button from '@mui/material/Button';
// Style Imports
import tableStyles from '@core/styles/table.module.css';
import { deleteProductVariation } from '@/app/server/productVariation';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { toast } from 'react-toastify';
import ProductVariationView from './ProductVariationView';

export const paymentStatus = {
  1: { text: 'Paid', color: 'success' },
  2: { text: 'Pending', color: 'warning' },
  3: { text: 'Cancelled', color: 'secondary' },
  4: { text: 'Failed', color: 'error' }
};
export const statusChipColor = {
  Delivered: { color: 'success' },
  'Out for Delivery': { color: 'primary' },
  'Ready to Pickup': { color: 'info' },
  Dispatched: { color: 'warning' }
};

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

const ProductVariationListTable = ({ productData, statusMap, stockStatusMap }) => {
  const NEXT_PUBLIC_BACKEND_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState(productData?.productVariations || []);
  const [globalFilter, setGlobalFilter] = useState('');
  const { lang: locale } = useParams();
  const [selectedId, setSelectedId] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // State for dialog
  const [openVariationDialog, setOpenVariationDialog] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(null);

  const handleDeleteConfirmation = id => {
    setSelectedId(id);
    setOpenConfirmDialog(true);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteProductVariation(selectedId);
      if (response.success) {
        // Remove the deleted variation from local state
        setData(prev => prev.filter(variation => String(variation.id) !== String(selectedId)));
      } else {
        toast.error(response.message || 'Failed to delete.');
      }
      setOpenConfirmDialog(false); // Close the dialog after deletion
    } catch (error) {
      console.error('Error deleting team member:', error);
      setOpenConfirmDialog(false); // Close the dialog on error as well
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('product.name', {
        header: 'Name',
        cell: ({ row }) => (
          <div
            className='flex items-center gap-4'
            onClick={() => router.push(`/${locale}/admin/ecommerce/products/details/${row?.original?.id}`)}
          >
            <Image
              src={`${NEXT_PUBLIC_BACKEND_DOMAIN}${row?.original?.variationImages[0].filePath}`}
              width={38}
              height={38}
              alt='Picture of the author'
            />
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row?.original?.product?.name}
              </Typography>
              <Typography variant='body2'>{row.original?.description}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('regularPrice', {
        header: 'Price',
        cell: ({ row }) => <Typography>${parseFloat(row.original?.regularPriceB2B).toFixed(2)}</Typography>
      }),
      columnHelper.accessor('stockQuantity', {
        header: 'Quantity',
        cell: ({ row }) => <Typography>{row.original?.stockQuantity}</Typography>
      }),
      columnHelper.accessor('stockStatus', {
        header: 'Stock Status',
        cell: ({ row }) => (
          <Chip
            label={stockStatusMap[row.original?.stockStatus]?.label || 'Unknown'}
            variant='tonal'
            color={stockStatusMap[row.original?.stockStatus]?.color || 'default'}
            size='small'
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => {
          const variationId = row.original.id;

          const isOnlyOneVariation = data.length === 1;

          return (
            <div className='flex items-center'>
              <OptionMenu
                iconButtonProps={{ size: 'medium' }}
                iconClassName='text-textSecondary'
                options={[
                  {
                    text: 'View',
                    icon: 'ri-eye-line text-[16px]',
                    menuItemProps: {
                      onClick: () => {
                        setSelectedVariation(row.original);
                        setOpenVariationDialog(true);
                      },
                      className: 'gap-2 action-btn-comp'
                    }
                  },
                  // Conditionally render delete option only if more than 1 variation exists
                  ...(!isOnlyOneVariation
                    ? [
                      {
                        text: 'Delete',
                        icon: 'ri-delete-bin-7-line text-[16px]',
                        menuItemProps: {
                          onClick: () => handleDeleteConfirmation(variationId),
                          className: 'gap-2 action-btn-comp'
                        }
                      }
                    ]
                    : [])
                ]}
              />
            </div>
          );
        },
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  const table = useReactTable({
    data: data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  });

  return (
    <Card>
      <CardContent className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4'>
        <Typography variant='h5'>Product Variation List</Typography>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Product Variation...'
          className='max-sm:is-full'
        />
      </CardContent>
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
        rowsPerPageOptions={[10, 25, 50, 100]}
        component='div'
        className='border-bs'
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page);
        }}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
      />
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

      <Dialog open={openVariationDialog} onClose={() => setOpenVariationDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Product Variation View</DialogTitle>
        <DialogContent dividers>
          {selectedVariation && <ProductVariationView variation={selectedVariation} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVariationDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ProductVariationListTable;
