import { useState, useEffect } from 'react'
import TextField from '@mui/material/TextField' // Make sure to import TextField from MUI

export const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}) => {
  // Local state for the input value
  const [inputValue, setInputValue] = useState(initialValue)

  // Update local state when the external value changes
  useEffect(() => {
    setInputValue(initialValue)
  }, [initialValue])

  // Trigger onChange after debounce delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChange(inputValue)
    }, debounce)

    // Clear timeout on cleanup
    return () => clearTimeout(timeoutId)
  }, [inputValue, debounce, onChange])

  return (
    <TextField
      {...props}
      value={inputValue}
      onChange={event => setInputValue(event.target.value)}
      size='small'
    />
  )
}
