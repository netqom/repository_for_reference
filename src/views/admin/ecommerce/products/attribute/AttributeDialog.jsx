'use client'
import React from 'react'
import { Dialog, DialogTitle, DialogContent } from '@mui/material'
import AttributeForm from './attribute-form'

export default function AttributeDialog({ open, onClose, attributeId, refreshList }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>{attributeId ? 'Edit Attribute' : 'Add New Attribute'}</DialogTitle>
      <DialogContent>
        <AttributeForm
          attributeId={attributeId}
          onClose={onClose}
          refreshList={refreshList}
        />
      </DialogContent>
    </Dialog>
  )
}
