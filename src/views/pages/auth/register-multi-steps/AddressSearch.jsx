'use client'
// React Imports
import { useState, useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'

// MUI Imports
import TextField from '@mui/material/TextField'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

const AddressSearch = ({ label = 'Search Address', placeholder = 'Enter your address...' }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimeoutRef = useRef(null)
  const suggestionsRef = useRef(null)

  const {
    setValue,
    formState: { errors }
  } = useFormContext()

  // Debounced search function
  useEffect(() => {
    if (searchQuery.length > 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      searchTimeoutRef.current = setTimeout(() => {
        searchAddress(searchQuery)
      }, 500)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const searchAddress = async query => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`
      )
      const data = await response.json()
      setSuggestions(data)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error searching address:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = suggestion => {
    const address = suggestion.address || {}

    // Parse the display name to get address components
    const displayName = suggestion.display_name
    const addressParts = displayName.split(', ')

    // Extract address components from the suggestion
    const addressLine1 =
      [address.house_number, address.road || address.street].filter(Boolean).join(' ') || addressParts[0] || ''

    const addressLine2 = address.suburb || address.neighbourhood || ''

    const city = address.city || address.town || address.village || address.municipality || ''

    const state = address.state || address.province || address.region || ''

    const postalCode = address.postcode || ''

    const country = address.country || ''

    const lat = suggestion.lat || ''
    const long = suggestion.lon || ''

    // Set all address fields
    setValue('address.addressLine1', addressLine1)
    setValue('address.addressLine2', addressLine2)
    setValue('address.city', city)
    setValue('address.state', state)
    setValue('address.postalCode', postalCode)
    setValue('address.country', country)
    setValue('address.lat', lat)
    setValue('address.long', long)

    // Update search query with selected address
    setSearchQuery(displayName)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    // Clear all address fields
    setValue('address.addressLine1', '')
    setValue('address.addressLine2', '')
    setValue('address.city', '')
    setValue('address.state', '')
    setValue('address.postalCode', '')
    setValue('address.country', '')
    setValue('address.lat', '')
    setValue('address.long', '')
  }

  return (
    <div className='relative' ref={suggestionsRef}>
      <TextField
        fullWidth
        label={label}
        placeholder={placeholder}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              {loading && <CircularProgress size={20} />}
              {searchQuery && (
                <IconButton size='small' onClick={clearSearch} edge='end'>
                  <i className='ri-close-line' />
                </IconButton>
              )}
              <IconButton size='small' edge='end'>
                <i className='ri-map-pin-line' />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      {showSuggestions && suggestions.length > 0 && (
        <Paper elevation={3} className='absolute top-full left-0 right-0 z-10 max-h-60 overflow-auto mt-1'>
          <List dense>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleSuggestionClick(suggestion)}
                className='hover:bg-gray-50 cursor-pointer'
              >
                <ListItemText
                  primary={suggestion.display_name}
                  secondary={`${suggestion.type} • ${suggestion.importance?.toFixed(2) || 'N/A'}`}
                  primaryTypographyProps={{
                    className: 'text-sm'
                  }}
                  secondaryTypographyProps={{
                    className: 'text-xs text-gray-500'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {showSuggestions && suggestions.length === 0 && !loading && searchQuery.length > 2 && (
        <Paper elevation={3} className='absolute top-full left-0 right-0 z-10 mt-1'>
          <List dense>
            <ListItem>
              <ListItemText
                primary='No addresses found'
                secondary='Try a different search term'
                primaryTypographyProps={{
                  className: 'text-sm text-gray-500'
                }}
                secondaryTypographyProps={{
                  className: 'text-xs text-gray-400'
                }}
              />
            </ListItem>
          </List>
        </Paper>
      )}
    </div>
  )
}

export default AddressSearch
