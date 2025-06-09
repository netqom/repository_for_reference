import { FormControlLabel, Checkbox } from '@mui/material';

const CustomCheckboxLabel = ({ label, id, name, defaultChecked, ...rest }) => {
  return (
    <FormControlLabel
      id={id}
      label={label}
      control={<Checkbox sx={{ py: 0 }} defaultChecked={defaultChecked} name={name} />}
      sx={{
        '& .MuiFormControlLabel-label': {
          fontSize: '14px',
          fontFamily: 'Montserrat, sans-serif',
        },
        borderColor: '#AAAAAA',
        ...rest.sx, // allow overrides if needed
      }}
      {...rest}
    />
  );
};

export default CustomCheckboxLabel;
