'use client'

// React Imports
import { useState } from 'react'

const OpenDialogOnClick = props => {
  // Props
  const {
    element: Element,
    dialog: Dialog,
    elementProps,
    dialogProps,
    onConfirm // Callback to be called after confirmation
  } = props

  // State to control dialog open
  const [open, setOpen] = useState(false)

  // Extract custom onClick from elementProps
  const { onClick: elementOnClick, ...restElementProps } = elementProps

  // Handle element click
  const handleElementClick = e => {
    elementOnClick && elementOnClick(e)
    setOpen(true)
  }

  // Handle confirmation (called from dialog)
  const handleConfirm = () => {

    alert('her;;;');
    if (onConfirm) onConfirm()
    setOpen(false)
  }

  return (
    <>
      <Element onClick={handleElementClick} {...restElementProps} />
      <Dialog
        open={open}
        setOpen={setOpen}
        onConfirm={handleConfirm}
        {...dialogProps}
        closeAfterTransition={false}
      />
    </>
  )
}

export default OpenDialogOnClick
