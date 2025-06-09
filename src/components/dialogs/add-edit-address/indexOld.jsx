import AddressSearch from "@/views/pages/wizard-examples/checkout/AddressSearch"


const AddEditAddress = ({ open, setOpen, data }) => {
  const initialSelected = customInputData?.find(item => item.isSelected)?.value || ''
  const [selected, setSelected] = useState(initialSelected)
  const [addressData, setAddressData] = useState(initialAddressData)

  const handleAddressSelect = (selectedAddress) => {
    // Map the selectedAddress fields to your addressData fields
    setAddressData({
      ...addressData,
      address1: selectedAddress.street || selectedAddress.address1 || '',
      address2: selectedAddress.address2 || '',
      city: selectedAddress.city || '',
      state: selectedAddress.state || '',
      zipCode: selectedAddress.zipCode || '',
      country: selectedAddress.country || ''
    })
  }

  useEffect(() => {
    setAddressData(data ?? initialAddressData)
  }, [open, data])

  return (
    <Dialog open={open} maxWidth='md' scroll='body' onClose={() => { setOpen(false); setSelected(initialSelected) }}>
      <DialogTitle>{data ? 'Edit Address' : 'Add New Address'}</DialogTitle>
      <form onSubmit={e => e.preventDefault()}>
        <DialogContent>
          {/* Replace these fields with AddressSearch */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <AddressSearch onAddressSelect={handleAddressSelect} />
            </Grid>

            {/* The rest of your fields remain the same */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='First Name'
                value={addressData.firstName}
                onChange={e => setAddressData({ ...addressData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Last Name'
                value={addressData.lastName}
                onChange={e => setAddressData({ ...addressData, lastName: e.target.value })}
              />
            </Grid>

            {/* You can also show read-only fields for auto-filled data if needed */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Address Line 1'
                value={addressData.address1}
                onChange={e => setAddressData({ ...addressData, address1: e.target.value })}
              />
            </Grid>

            {/* etc… */}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={() => setOpen(false)}>Save</Button>
          <Button variant='outlined' onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
