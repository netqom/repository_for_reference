'use client';

// React Imports
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
// Next Imports
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

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

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n';

// Style Imports
import tableStyles from '@core/styles/table.module.css';
import { deleteProduct, getProductList, getProductRawData, updateStatus, getAllProductList } from '@/app/server/actions';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useDispatch } from 'react-redux';
import { callCommonAction } from '@/redux-store/slices/common';
import { toast } from 'react-toastify';
import { Router } from 'next/router';
//import { Download, Loader2 } from "lucide-react"

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

// Vars
const productCategoryObj = {
  Accessories: { icon: 'ri-headphone-line', color: 'error' },
  'Home Decor': { icon: 'ri-home-6-line', color: 'info' },
  Electronics: { icon: 'ri-computer-line', color: 'primary' },
  Shoes: { icon: 'ri-footprint-line', color: 'success' },
  Office: { icon: 'ri-briefcase-line', color: 'warning' },
  Games: { icon: 'ri-gamepad-line', color: 'secondary' }
};

const productStatusObj = {
  Scheduled: { title: 'Scheduled', color: 'warning' },
  Published: { title: 'Publish', color: 'success' },
  Inactive: { title: 'Inactive', color: 'error' }
};

// Column Definitions
const columnHelper = createColumnHelper();

// Helper function to escape CSV values
function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return ""
  }

  const stringValue = String(value)

  // If the value contains commas, quotes, or newlines, wrap it in quotes and escape any quotes
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

const ProductListTable = () => {
  const NEXT_PUBLIC_BACKEND_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;
  const router = useRouter();
  // States
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState({});
  const [globalFilter, setGlobalFilter] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // State for dialog
  const [search, setSearch] = useState('');
  const [rawProduct, setRawProduct] = useState([]);

  // Hooks
  const { lang: locale } = useParams();
  const dispatch = useDispatch();

  const fetchProducts = async (currentPage = 1, searchTerm = '') => {
    try {
      dispatch(callCommonAction({ loading: true }));
      const response = await getProductList(currentPage, rowsPerPage, searchTerm, filteredData);
      dispatch(callCommonAction({ loading: false }));
      if (response.statusCode === 200 && response.data) {
        const formatted = response?.data?.docs?.map(product => ({
          id: product?._id,
          name: product?.name,
          categories: product?.categories,
          supplier: product?.supplier,
          totalQuantity: product?.totalQuantity,
          sku: product?.sku,
          status: product?.status,
          avatar: product?.featuredImage?.filePath,
          username: product?.name.split(' ')[0]
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

  useEffect(() => {
    if (!filteredData || filteredData.length === 0) return;
    fetchProducts(page + 1, search, filteredData);
  }, [page, rowsPerPage, search, filteredData]);



  const getRawData = async () => {
    try {
      const response = await getProductRawData();
      if (response?.data) {
        setRawProduct(response?.data);
      }
    } catch (error) {
      console.error('Failed to fetch raw data:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    getRawData();
  }, []);


  const refreshList = async () => {
    await fetchProducts();
  };

  const handleDeleteConfirmation = id => {
    setSelectedCatId(id);
    setOpenConfirmDialog(true);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteProduct(selectedCatId);

      if (response.success) {
        // Remove the deleted user from the table
        refreshList();
      } else {
        toast.error(response.message || 'Failed to delete.');
      }
      setOpenConfirmDialog(false); // Close the dialog after deletion
    } catch (error) {
      console.error('Error deleting team member:', error);
      setOpenConfirmDialog(false); // Close the dialog on error as well
    }
  };

  const handleEdit = id => {
    router.push(`/${locale}/admin/ecommerce/products/${id}`); // Adjust the path as per your routing
  };

  const columns = useMemo(
    () => [
      // {
      //   id: 'select',
      //   header: ({ table }) => (
      //     <Checkbox
      //       {...{
      //         checked: table.getIsAllRowsSelected(),
      //         indeterminate: table.getIsSomeRowsSelected(),
      //         onChange: table.getToggleAllRowsSelectedHandler()
      //       }}
      //     />
      //   ),
      //   cell: ({ row }) => (
      //     <Checkbox
      //       {...{
      //         checked: row.getIsSelected(),
      //         disabled: !row.getCanSelect(),
      //         indeterminate: row.getIsSomeSelected(),
      //         onChange: row.getToggleSelectedHandler()
      //       }}
      //     />
      //   )
      // },
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => (
          <div className='flex cursor-pointer items-center gap-4' onClick={() => router.push(`/${locale}/admin/ecommerce/products/details/${row?.original?.id}`)}>
            {row?.original?.avatar && <Image src={`${NEXT_PUBLIC_BACKEND_DOMAIN}${row?.original?.avatar}`} width={38} height={38} alt="Picture of the author" />}
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.name}
              </Typography>
              <Typography variant='body2'>{'Short description goes here'}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('supplier', {
        header: 'Supplier',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            {/* <CustomAvatar skin='light' color={productCategoryObj[row.original.category]?.color} size={30}>
              <i className={classnames(productCategoryObj[row.original.category]?.icon, 'text-lg')} />
            </CustomAvatar> */}
            <Typography color='text.primary'>{row.original?.supplier?.companyName}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('categories', {
        header: 'Category',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            {/* <CustomAvatar skin='light' color={productCategoryObj[row.original.category]?.color} size={30}>
              <i className={classnames(productCategoryObj[row.original.category]?.icon, 'text-lg')} />
            </CustomAvatar> */}
            <Typography color='text.primary'>{row.original?.categories?.map(ele => ele?.name).join(', ')}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('sku', {
        header: 'SKU',
        cell: ({ row }) => <Typography>{row.original?.sku}</Typography>
      }),
      // columnHelper.accessor('price', {
      //   header: 'Price',
      //   cell: ({ row }) => <Typography>{row.original?.defaultPrice}</Typography>
      // }),
      columnHelper.accessor('totalQuantity', {
        header: 'QTY',
        cell: ({ row }) => <Typography>{row.original.totalQuantity}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          const isPublished = status === 1;

          return (
            <Chip
              label={isPublished ? 'Publish' : 'Draft'}
              color={isPublished ? 'success' : 'default'}
              variant='tonal'
              size='small'
            />
          );
        }
      }),

      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => {
          const currentStatus = row.original.status;

          const handleStatusToggle = async () => {
            const newStatus = currentStatus === 1 ? 0 : 1;
            const response = await updateStatus(row.original.id, 'status', { status: newStatus });
            refreshList();
          };

          return (
            <div className='flex items-center'>
              {/* Edit button */}
              <IconButton size='small' onClick={() => handleEdit(row.original.id)}>
                <i className='ri-edit-box-line text-[22px] text-textSecondary' />
              </IconButton>

              {/* Delete button */}
              <IconButton size='small' onClick={() => handleDeleteConfirmation(row.original.id)}>
                <i className='ri-delete-bin-line text-[22px] text-red-500' />
              </IconButton>

              {/* Status toggle button */}
              <IconButton onClick={handleStatusToggle}>
                {currentStatus === 1 ? (
                  <i className='ri-eye-line text-textSecondary' title='Set Inactive' />
                ) : (
                  <i className='ri-eye-off-line text-textSecondary' title='Set Active' />
                )}
              </IconButton>
            </div>
          );
        },

        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, filteredData]
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


  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = event => {
    table.setPageSize(parseInt(event.target.value));
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const response = await getAllProductList();
      // console.log('suppliers', response);

      const headers = [
        "SKU",
        "Name",
        "Short Description",
        "Description",
        "Stock Status",
        "Status",
        "Default Price",
        "Min Price B2B",
        "Max Price B2B",
        "Min Price B2C",
        "Max Price B2C",
        "Supplier",
        "Categories",
        "Featured Image",
      ]

      // Create CSV rows
      const rows = []

      // Add header row
      rows.push(headers.join(","))

      // Process products and variations
      for (const product of response.data) {
        // Add main product row
        rows.push(
          [
            escapeCsvValue(product.sku),
            escapeCsvValue(product.name),
            escapeCsvValue(product.shortDescription || ""),
            escapeCsvValue(product.description || ""),
            escapeCsvValue(product.stockStatus === "in_stock" ? "In Stock" : "Out of Stock"),
            escapeCsvValue(product.status === 1 ? "Published" : "Draft"),
            product.defaultPrice,
            product.minPriceB2B,
            product.maxPriceB2B,
            product.minPriceB2C,
            product.maxPriceB2C,
            escapeCsvValue(product.supplier?.companyName || ""),
            escapeCsvValue(product.categories?.map((cat) => cat.name).join(", ") || ""),
            escapeCsvValue(product.productFeaturedImage?.filePath || ""),
          ].join(","),
        )

        // Add variations if they exist
        if (product.productVariations && product.productVariations.length > 0) {
          for (const variation of product.productVariations) {
            // Get attribute information
            const attributeInfo =
              variation.attributeVariations
                ?.map((attrVar) => {
                  const attrName = attrVar.productAttribute?.name || "Unknown"
                  const attrValue = attrVar.metaValue || ""
                  const unit = attrVar.productMeasurementUnit?.symbol || ""
                  return `${attrName}: ${attrValue}${unit ? " " + unit : ""}`
                })
                .join(", ") || ""

            // Add variation as a separate row with parent SKU reference
            rows.push(
              [
                escapeCsvValue(`${product.sku}-VAR-${variation._id.toString().substring(0, 8)}`),
                escapeCsvValue(`${product.name} - ${attributeInfo}`),
                escapeCsvValue(variation.description || ""),
                escapeCsvValue(variation.description || ""),
                escapeCsvValue(variation.stockStatus === "in_stock" ? "In Stock" : "Out of Stock"),
                escapeCsvValue(variation.status ? "Published" : "Draft"),
                variation.regularPriceB2C || 0,
                variation.regularPriceB2B || 0,
                variation.regularPriceB2B || 0,
                variation.regularPriceB2C || 0,
                variation.regularPriceB2C || 0,
                escapeCsvValue(variation.supplier?.companyName || product.supplier?.companyName || ""),
                escapeCsvValue(
                  variation.categories?.map((cat) => cat.name).join(", ") ||
                  product.categories?.map((cat) => cat.name).join(", ") ||
                  "",
                ),
                escapeCsvValue(
                  variation.productFeaturedImage?.filePath ||
                  (variation.variationImages && variation.variationImages.length > 0
                    ? variation.variationImages[0].filePath
                    : ""),
                ),
              ].join(","),
            )
          }
        }
      }

      // Generate CSV content
      const csvContent = rows.join("\n")

      // Create a blob from the CSV content
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "products-export.csv")
      document.body.appendChild(link)
      link.click()
      link.remove()

      // Clean up the object URL
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error("Error exporting products:", error)
      alert("Failed to export products. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }


  return (
    <>
      <Card>
        <CardHeader title='Filters' className='pbe-4' />
        <TableFilters setFilters={setFilteredData} rawProductData={rawProduct} />
        <Divider />
        <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 p-5'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Product'
            className='max-sm:is-full'
          />
          <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
            <Button
              color='secondary'
              variant='outlined'
              className='max-sm:is-full is-auto'
              startIcon={<i className='ri-upload-2-line' />}
              onClick={handleExport} disabled={isExporting}
            >
              Export
            </Button>
            <Button
              variant='contained'
              component={Link}
              href={getLocalizedUrl('/admin/ecommerce/products/add', locale)}
              startIcon={<i className='ri-add-line' />}
              className='max-sm:is-full is-auto'
            >
              Add Product
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

      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this Product?</Typography>
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
    </>
  );
};

export default ProductListTable;
