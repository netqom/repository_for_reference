'use client'
// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { useDispatch } from 'react-redux'
import { callCommonAction } from '@/redux-store/slices/common'
import { getOrderList } from '@/app/server/order'
import moment from 'moment'

const paymentStatus = {
  2: { text: 'Paid', color: 'success', colorClassName: 'text-success' },
  1: { text: 'Pending', color: 'warning', colorClassName: 'text-warning' },
  4: { text: 'Refunded', color: 'secondary', colorClassName: 'text-secondary' },
  3: { text: 'Failed', color: 'error', colorClassName: 'text-error' }
}

const statusChipColor = {
  2: { text: 'Paid', color: 'success', colorClassName: 'text-success' },
  1: { text: 'Pending', color: 'warning', colorClassName: 'text-warning' },
  4: { text: 'Refunded', color: 'secondary', colorClassName: 'text-secondary' },
  3: { text: 'Failed', color: 'error', colorClassName: 'text-error' }
}

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => setValue(initialValue), [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)
    return () => clearTimeout(timeout)
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const columnHelper = createColumnHelper()

const OrderListTable = ({ orderData }) => {
  const dispatch = useDispatch()
  const { lang: locale } = useParams()
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalRecords, setTotalRecords] = useState(0)
  const [search, setSearch] = useState('')
  const NEXT_PUBLIC_BACKEND_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_DOMAIN

  useEffect(() => {
    fetchOrderList(page + 1, rowsPerPage)
  }, [page, rowsPerPage, search])

  const fetchOrderList = async (currentPage = 1, pageSize = rowsPerPage) => {
    try {
      dispatch(callCommonAction({ loading: true }))
      const response = await getOrderList(currentPage, pageSize, search, {})
      dispatch(callCommonAction({ loading: false }))

      if (response.statusCode === 200 && response.data) {
        const formatted = response.data.docs.map(order => ({
          id: order?._id,
          orderNumber: order?.orderNumber,
          createdAt: order?.createdAt,
          orderStatus: order?.orderStatus,
          commission: order?.commission,
          paymentStatus: order?.paymentStatus,
          sender: order?.sender,
          totalAmount: order?.totalAmount,
          order: order?.order,
          updatedAt: order?.updatedAt,
          avatar: order?.createdByDetails?.userImage,
          username: order?.createdByDetails?.name,
          email: order?.createdByDetails?.email,
          supportticketmsgs: order?.supportticketmsgs
        }))
        setData(formatted)
        setTotalRecords(response.data.totalDocs || 0)
      }
    } catch (error) {
      dispatch(callCommonAction({ loading: false }))
      console.error('Failed to fetch order list', error)
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    const newSize = parseInt(event.target.value, 10)
    setRowsPerPage(newSize)
    setPage(0)
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('orderNumber', {
        header: 'Order',
        cell: ({ row }) => (
          <Typography
            component={Link}
            href={getLocalizedUrl(`/apps/ecommerce/orders/details/${row.original.id}`, locale)}
            color='primary.main'
          >
            {`#${row.original.orderNumber}`}
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
            {getAvatar({ avatar: row.original.avatar, customer: row.original?.username })}
            <div className='flex flex-col'>
              <Typography
                component={Link}
                href={getLocalizedUrl('/apps/ecommerce/customers/details/879861', locale)}
                color='text.primary'
                className='font-medium hover:text-primary'
              >
                {row.original.username}
              </Typography>
              <Typography variant='body2'>{row.original.email}</Typography>
            </div>
          </div>
        )
      }),
       columnHelper.accessor('totalAmount', {
        header: 'Amount',
        cell: ({ row }) => <Typography>€{parseFloat(row.original?.totalAmount).toFixed(2)}</Typography>
      }),
      columnHelper.accessor('commission', {
        header: 'Commission',
        cell: ({ row }) => <Typography>€{parseFloat(row.original?.commission).toFixed(2)}</Typography>
      }),
      columnHelper.accessor('paymentStatus', {
        header: 'Payment',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <i
              className={classnames(
                'ri-circle-fill bs-2.5 is-2.5',
                paymentStatus[row.original?.paymentStatus]?.colorClassName
              )}
            />
            <Typography color={`${paymentStatus[row.original?.paymentStatus]?.color}.main`} className='font-medium'>
              {paymentStatus[row.original?.paymentStatus]?.text}
            </Typography>
          </div>
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
                  href: getLocalizedUrl(`/apps/ecommerce/orders/details/${row.original.order}`, locale),
                  linkProps: { className: 'flex items-center is-full gap-2 plb-2 pli-4' }
                },
                {
                  text: 'Delete',
                  icon: 'ri-delete-bin-7-line text-[22px]',
                  menuItemProps: {
                    onClick: () => setData(data?.filter(order => order.id !== row.original.id)),
                    className: 'flex items-center gap-2'
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection
  })

  const getAvatar = ({ avatar, customer }) => {
    return avatar ? (
      <CustomAvatar src={avatar} skin='light' size={34} />
    ) : (
      <CustomAvatar skin='light' color='primary' size={34}>
        {getInitials(customer)}
      </CustomAvatar>
    )
  }

  return (
    <Card>
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <DebouncedInput
          value={search}
          onChange={value => setSearch(value)}
          placeholder='Search Order'
          className='sm:is-auto'
        />
        {/* <Button variant='outlined' color='secondary' startIcon={<i className='ri-upload-2-line' />}>
          Export
        </Button> */}
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
    </Card>
  )
}

export default OrderListTable
