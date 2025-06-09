// React Imports
import { useState, useEffect } from 'react';

// MUI Imports
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const TableFilters = ({ setFilter, filter }) => {

  const statusOptions = [
    { value: '', label: 'Select Status' },
    { value: 1, label: 'Open' },
    { value: 3, label: 'Pending' },
    { value: 4, label: 'In Progress' },
    { value: 5, label: 'Resolved' },
    { value: 6, label: 'Rejected' },
  ];
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
              value={Number(filter?.status) || 1}
              onChange={e => setFilter({ ...filter, status: e.target.value })}
              labelId='status-select'
              inputProps={{ placeholder: 'Select Status' }}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}

            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  );
};

export default TableFilters;
