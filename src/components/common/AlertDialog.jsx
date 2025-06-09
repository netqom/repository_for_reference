import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  TextField
} from '@mui/material'

const AlertDialog = ({
  open,
  title,
  description,
  confirmText,
  cancelText,
  confirmColor,
  cancelColor,
  onConfirm,
  onCancel,
  isLoading,
  showInput,
  rejectionReasonText,
  setRejectionReasonText
}) => {
  const handleConfirmClick = () => {
    if (onConfirm) {
      onConfirm(rejectionReasonText) // Pass current value back
    }
  }

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth='xs'>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>

        {showInput && (
          <TextField
            autoFocus
            fullWidth
            margin='dense'
            label='Rejection Reason'
            value={rejectionReasonText}
            onChange={event => setRejectionReasonText(event.target.value)}
            multiline
            rows={3}
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} color={cancelColor || 'inherit'}>
          {cancelText || 'Cancel'}
        </Button>
        <Button
          onClick={handleConfirmClick}
          color={confirmColor || 'primary'}
          variant='contained'
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={20} /> : confirmText || 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AlertDialog
