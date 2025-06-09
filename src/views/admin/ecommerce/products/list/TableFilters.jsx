// React Imports
import { useState, useEffect } from 'react';

// MUI Imports
import Grid from '@mui/material/Grid2';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Controller, useForm } from 'react-hook-form';
import { Autocomplete, TextField } from '@mui/material';

// Vars
const productStockObj = {
  'In Stock': true,
  'Out of Stock': false
};

const TableFilters = ({ setFilters, rawProductData }) => {
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    setFilters({
      status: status,
      categories: JSON.stringify(categories),
      stockStatus: stock
    });
  }, [categories, stock, status, setFilters]);

  useEffect(() => {
    if (rawProductData?.nestedCategories && Array.isArray(rawProductData.nestedCategories)) {
      setCategoryList(rawProductData.nestedCategories);
    }
  }, [rawProductData]);

  function flattenCategories(categories, parent = '', level = 0) {
    return categories.flatMap(cat => {
      const current = {
        id: cat._id,
        title: cat.name,
        fullPath: parent ? `${parent} > ${cat.name}` : cat.name,
        level
      };
      const children = cat.children ? flattenCategories(cat.children, current.fullPath, level + 1) : [];
      return [current, ...children];
    });
  }

  const flatOptions = flattenCategories(categoryList);
  const selectedOptions = flatOptions.filter(opt => categories.includes(opt.id));

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='status-select'>Status</InputLabel>
            <Select
              fullWidth
              id='select-status'
              label='Status'
              value={status}
              onChange={e => setStatus(e.target.value)}
              labelId='status-select'
            >
              <MenuItem value=''>Select Status</MenuItem>
              <MenuItem value={1}>Publish</MenuItem>
              <MenuItem value={0}>Draft</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {/* <FormControl fullWidth>
            <InputLabel id='category-select'>Category</InputLabel>
            <Select
              fullWidth
              id='select-category'
              value={category}
              onChange={e => setCategory(e.target.value)}
              label='Category'
              labelId='category-select'
            >
              <MenuItem value=''>Select Category</MenuItem>
              <MenuItem value='Accessories'>Accessories</MenuItem>
              <MenuItem value='Home Decor'>Home Decor</MenuItem>
              <MenuItem value='Electronics'>Electronics</MenuItem>
              <MenuItem value='Shoes'>Shoes</MenuItem>
              <MenuItem value='Office'>Office</MenuItem>
              <MenuItem value='Games'>Games</MenuItem>
            </Select>
          </FormControl> */}

          <FormControl fullWidth>
            <Autocomplete
              multiple
              options={flatOptions}
              getOptionLabel={option => option.fullPath}
              groupBy={option => option.fullPath.split(' > ')[0]}
              value={selectedOptions}
              onChange={(_, selectedOptions) => {
                const selectedIds = selectedOptions.map(opt => opt.id);
                setCategories(selectedIds);
              }}
              renderInput={params => <TextField {...params} label='Select Category' />}
              sx={{ width: 400 }}
            />
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='stock-select'>Stock</InputLabel>
            <Select
              fullWidth
              id='select-stock'
              value={stock}
              onChange={e => setStock(e.target.value)}
              label='Stock'
              labelId='stock-select'
            >
              <MenuItem value=''>Select Stock</MenuItem>
              <MenuItem value='in_stock'>In Stock</MenuItem>
              <MenuItem value='out_of_stock'>Out of Stock</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  );
};

export default TableFilters;
