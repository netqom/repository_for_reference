'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import { adminRole } from '@configs/constant'

// Table Imports
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import FileTypeIcon from '@/components/common/fileTypeIcon'
import { Chip, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'

import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import DropzoneImageUploader from '@/components/common/DropzoneImageUploader'
import SimpleDropzoneImageUploader from '@/components/common/SimpleDropzoneImageUploader'
import { updateBusinessProfileStatus, updateTradeProfessional } from '@/app/server/trade-professional'
import { toast } from 'react-toastify'
import { fetchById } from '@/app/[lang]/(dashboard)/(private)/trade-professional/profile/page'
import { updateStatus } from '@/app/server/actions'
import { tradeProfessionalService } from '@/services/trade-professionals'
import { getSession } from 'next-auth/react'
import { checkUserRoleIsAdmin } from '@/components/common/userRole'
// Column helper
const columnHelper = createColumnHelper()

const getStatusLabel = status => {
  switch (status) {
    case 1:
      return 'Verified'
    case 0:
      return 'Unverified'
    case 2:
    default:
      return 'Pending'
  }
}

const ProjectListTable = ({ documentData }) => {
  const [data, setData] = useState(documentData?.documents ?? [])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedRowFile, setSelectedRowFile] = useState(null)
  const [documentType, setDocumentType] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [documentsToRemove, setDocumentsToRemove] = useState([])

  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const BACKEND_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_DOMAIN || 'http://localhost:3001'

  useEffect(() => {
    const verifyRole = async () => {
      const isAdminUser = await checkUserRoleIsAdmin()
      if (isAdminUser) {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }
    }

    verifyRole()
  }, [])

  // Group data by docType
  const groupedDocuments = useMemo(() => {
    return data?.reduce((acc, doc) => {
      const group = doc.docType
      if (!acc[group]) acc[group] = []
      acc[group].push(doc)
      return acc
    }, {})
  }, [data])

  const handleOpen = (rowData, docType) => {
    setSelectedRowFile(rowData)
    setDocumentsToRemove([rowData?._id])
    setDocumentType(docType ?? 'business_documents')
    setOpenDialog(true)
  }
  const handleClose = () => {
    setDocumentsToRemove([])
    setDocumentsToRemove('')
    setOpenDialog(false)
    setSelectedDocument(null)
  }

  const refreshList = async () => {
    const data = await fetchById(documentData?._id)
    setData(data?.data?.documents)
  }

  const handleUpload = async () => {
    try {
      const requestData = {
        name: documentData.name,
        email: documentData.email,
        phone: documentData.phone,
        address: {
          addressLine1: documentData.addresses?.addressLine1 || '',
          addressLine2: documentData.addresses?.addressLine2 || '',
          city: documentData.addresses?.city || '',
          state: documentData.addresses?.state || '',
          postalCode: documentData.addresses?.postalCode || '',
          country: documentData.addresses?.country || '',
          lat: documentData.addresses?.lat || '',
          long: documentData.addresses?.long || ''
        },
        business_name: documentData.business.name,
        business_email: documentData.business.email,
        business_phone: documentData.business.phone,
        accept_term: 1
      }

      const formData = new FormData()

      // Append regular user data
      for (const key in requestData) {
        if (typeof requestData[key] === 'object') {
          formData.append(key, JSON.stringify(requestData[key]))
        } else {
          formData.append(key, requestData[key])
        }
      }

      // Append uploaded documents
      Object.entries(uploadedFile).forEach(([docType, file]) => {
        // Check if file is a File or Blob instance (means new upload)
        if (file && (file instanceof File || file instanceof Blob)) {
          formData.append(docType, file)
        }
      })

      // Append removed document IDs
      formData.append('documents_to_remove', JSON.stringify(documentsToRemove))

      const response = await updateTradeProfessional(documentData._id, formData)

      const isSuccess = response?.statusCode === 200 || response?.statusCode === 201

      if (isSuccess) {
        toast.success(response?.message || 'Operation successful')
        await refreshList()
        handleClose()
        return
      }

      const fieldErrors = response?.data?.errors
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([fieldName, messages]) => {
          setError(fieldName, { message: messages?.[0] || 'Invalid value' })
        })
      } else {
        toast.error(response?.message || 'Something went wrong.')
      }
    } catch (error) {
      console.error('User update failed:', error)
      toast.error('Unexpected error occurred. Please try again.')
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('fileName', {
        header: 'Document Name',
        cell: ({ row }) => {
          const fileName = row.original.fileName || ''
          const charLimit = 40
          const isTruncated = fileName.length > charLimit
          const displayName = isTruncated ? fileName.slice(0, charLimit) + '...' : fileName

          return (
            <div className='flex items-center gap-4'>
              <FileTypeIcon type={row.original.fileType} />
              <div className='flex flex-col'>
                <Tooltip title={isTruncated ? fileName : ''} arrow>
                  <Typography className='font-medium' color='text.primary' noWrap>
                    {displayName}
                  </Typography>
                </Tooltip>
                <Typography variant='body2'>{row.original.docTypeLabel}</Typography>
              </div>
            </div>
          )
        }
      }),

      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: ({ row }) => {
          const createdAt = row.original.createdAt
          const formattedDate = new Date(createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })

          return <Typography>{formattedDate}</Typography>
        }
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status

          const getStatusLabel = status => {
            switch (status) {
              case 1:
                return { label: 'Approved', color: 'success' }
              case 0:
                return { label: 'Rejected', color: 'error' }
              case 2:
                return { label: 'Pending', color: 'warning' }
              case 3:
                return { label: 'Under Review', color: 'info' }
              default:
                return { label: 'Unknown', color: 'default' }
            }
          }

          const { label, color } = getStatusLabel(status)

          return (
            <>
              <div className='flex gap-2 align-center'>
                <Chip label={label} color={color} size='small' />
                {isAdmin && (
                  <i className='ri-edit-line cursor-pointer' onClick={() => handleStatusClick(row.original)} clickable></i>
                )}
              </div>
            </>
          )
        }
      }),
      ,
      columnHelper.accessor('filePath', {
        header: 'Action',
        cell: ({ row }) => {
          const documentData = row.original
          const downloadUrl = `${BACKEND_DOMAIN}/${documentData?.filePath}`

          // const handleDownload = () => {
          //   const link = document.createElement('a');
          //   link.href = downloadUrl;
          //   link.setAttribute('download', documentData?.filePath?.split('/').pop());
          //   link.setAttribute('target', '_blank');
          //   document?.body?.appendChild(link);
          //   link.click();
          //   document?.body?.removeChild(link);
          // };

          const handleDownload = () => {
            try {
              const link = document.createElement('a')

              // Set the href to the file URL
              link.href = downloadUrl

              // Extract the file name from the filePath and set as the download name
              const fileName = documentData?.filePath?.split('/').pop() || 'download'

              link.setAttribute('download', fileName)
              link.setAttribute('target', '_blank')
              link.style.display = 'none'

              // Append the link only if document.body exists
              if (document.body) {
                document.body.appendChild(link)
                link.click()

                // Use a timeout to safely remove the node after the click event
                setTimeout(() => {
                  if (document.body.contains(link)) {
                    document.body.removeChild(link)
                  }
                }, 100)
              }
            } catch (error) {
              console.error('Download failed:', error)
            }
          }

          return (
            <div className='flex items-center gap-2'>
              <Button size='small' variant='outlined' onClick={handleDownload}>
                View
              </Button>
              {(documentData.status === 0 || documentData.status === 2) && (
                <Button
                  size='small'
                  variant='contained'
                  color='warning'
                  onClick={() => handleOpen(row.original, row.original?.docType)}
                >
                  Replace Document
                </Button>
              )}
            </div>
          )
        }
      })
    ],
    [isAdmin]
  )

  const handleStatusClick = document => {
    setSelectedDocument(document)
    setNewStatus(document.status)
    setStatusDialogOpen(true)
  }

  const handleStatusUpdate = async () => {
    try {
      const response = await updateBusinessProfileStatus(selectedDocument._id, 'status', { status: newStatus })
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        toast.success(response?.message || 'Status updated successfully')
        await refreshList()
        setSelectedDocument(null)
        setStatusDialogOpen(false)
      } else {
        toast.error(response?.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <>
      <div className='space-y-8'>
        {Object.entries(groupedDocuments).map(([docType, docs]) => {
          const table = useReactTable({
            data: docs,
            columns,
            getCoreRowModel: getCoreRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getSortedRowModel: getSortedRowModel(),
            getPaginationRowModel: getPaginationRowModel()
          })

          return (
            <Card key={docType}>
              <div className='p-4'>
                <Typography variant='h6' className='capitalize'>
                  {docType.replace(/_/g, ' ')}
                </Typography>
                <Divider className='my-4' />
                <div className='overflow-x-auto'>
                  <table className={tableStyles.table}>
                    <thead>
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th key={header.id}>
                              {header.isPlaceholder ? null : (
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
                      {table.getRowModel().rows.length === 0 ? (
                        <tr>
                          <td colSpan={columns.length} className='text-center'>
                            No data available
                          </td>
                        </tr>
                      ) : (
                        table.getRowModel().rows.map(row => (
                          <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>Replace Document</DialogTitle>
        <DialogContent>
          <SimpleDropzoneImageUploader
            fullWidth
            defaultValue={selectedRowFile ? [selectedRowFile] : []}
            fieldName='registration_certificate'
            title='Registration Certificate'
            multiple={false}
            maxFiles={1}
            requiredMessage='Registration Certificate is required'
            // onFilesChange={files => {
            //   setUploadedFile(Array.isArray(files) ? files[0] : files)
            // }}
            onFilesChange={files => {
              setUploadedFile(prev => ({
                ...prev,
                [documentType]: Array.isArray(files) ? files[0] : files
              }))
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary'>
            Cancel
          </Button>
          {/* Add save logic below */}
          <Button onClick={handleUpload} variant='contained'>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent sx={{ paddingTop: '20px !important' }}>
          <FormControl fullWidth>
            <InputLabel id='status-select-label'>Status</InputLabel>
            <Select
              labelId='status-select-label'
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              label='Status'
            >
              <MenuItem value={2}>Pending</MenuItem>
              <MenuItem value={1}>Approved</MenuItem>
              <MenuItem value={0}>Rejected</MenuItem>
              <MenuItem value={3}>Under Review</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSelectedDocument(null)
              setStatusDialogOpen(false)
            }}
            color='secondary'
          >
            Cancel
          </Button>
          <Button onClick={handleStatusUpdate} variant='contained' color='primary'>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProjectListTable
