// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid2'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

const TableFilters = ({ setFilters }) => {
  // Local state to store selected filter values
  const [selectedStatus, setSelectedStatus] = useState('')

  // Update parent with selected filters
  useEffect(() => {
    setFilters({
      status: selectedStatus
    })
  }, [selectedStatus, setFilters])

  return (
    <CardContent>
      <Grid container spacing={5}>

        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='status-select'>Select Status</InputLabel>
            <Select
              fullWidth
              id='select-status'
              label='Select Status'
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              labelId='status-select'
              inputProps={{ placeholder: 'Select Status' }}
            >
              <MenuItem value=''>Select Status</MenuItem>
              <MenuItem value='1'>Active</MenuItem>
              <MenuItem value='0'>Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
