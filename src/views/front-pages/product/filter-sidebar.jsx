'use client'

import { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import { FormGroup, Slider } from '@mui/material'
import CustomCheckboxLabel from './cstm-checkbox'
import { Drawer, Typography, IconButton, Box, Divider } from '@mui/material'
import { DebouncedInput } from '@/components/common/DebouncedInput'

const FilterSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className='border-b pb-6 mb-6'>
      <h4
        className='font-medium mb-3 flex items-center justify-between cursor-pointer'
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <i className={`ri-${isOpen ? 'arrow-up-s-line' : 'arrow-down-s-line'} h-4 w-4 transition-transform`}></i>
      </h4>
      <div className={`${isOpen ? 'block' : 'hidden'}`}>{children}</div>
    </div>
  )
}

export default function FilterSidebar({
  isMobile = false,
  isOpen = false,
  onClose,
  reawFilterData,
  setFilter,
  filter
}) {
  // Default price range values - could be dynamic based on your product data
  const [priceRange, setPriceRange] = useState([10, 10000])
  const [searchText, setSearchText] = useState('')
  const [selectedSupplierId, setSelectedSupplierId] = useState(null)

  // const isAnyFilterApplied = Boolean(
  //   searchText.trim() ||
  //     (filter.categories && filter.categories.length > 0) ||
  //     (filter.attributeVariations && filter.attributeVariations.length > 0) ||
  //     filter.supplier ||
  //     priceRange[0] !== 10 ||
  //     priceRange[1] !== 10000
  // )

  const handleCheckboxChange = (name, value, group = null) => {
    if (group === 'attributeVariations') {
      setFilter(prev => {
        const currentAttributes = Array.isArray(prev.attributeVariations) ? prev.attributeVariations : []

        const isAlreadySelected = currentAttributes.includes(value)

        if (isAlreadySelected) {
          // Uncheck the current value
          return {
            ...prev,
            attributeVariations: currentAttributes.filter(item => item !== value)
          }
        }

        // Otherwise, replace any existing variation from the same attribute group
        const updatedAttributes = currentAttributes.filter(variationId => {
          const isFromSameAttribute = reawFilterData.productAttributes.some(
            attr => attr.slug === name && attr.variations.some(variation => variation._id === variationId)
          )
          return !isFromSameAttribute
        })

        return {
          ...prev,
          attributeVariations: [...updatedAttributes, value]
        }
      })
    } else if (name === 'supplier') {
      const isAlreadySelected = filter.supplier === value
      const newValue = isAlreadySelected ? '' : value

      setFilter(prev => ({
        ...prev,
        supplier: newValue
      }))
    } else {
      // Handle other filters (category, suppliers, etc.)
      setFilter(prev => {
        const currentValues = Array.isArray(prev[name]) ? prev[name] : []
        const isAlreadySelected = currentValues.includes(value)

        return {
          ...prev,
          [name]: isAlreadySelected ? currentValues.filter(item => item !== value) : [...currentValues, value]
        }
      })
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilter(prevFilter => ({
        ...prevFilter,
        search_string: String(searchText)
      }))
    }, 500) // adjust debounce time (ms) as needed

    return () => clearTimeout(debounceTimer)
  }, [searchText, setFilter])

  const filterContent = (
    <>
    <div className='relative mb-6'>
          <input
            type='text'
            placeholder='Search'
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className='w-full border-0 border-b border-gray-300 py-2 text-sm focus:outline-none focus:border-black'
          />
          <i className='ri-search-line text-xl absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400'></i>
        </div>
      <div className='overflow-y-auto overflow-x-hidden max-h-[600px]'>
        

        {/* Categories Filter */}
        {reawFilterData?.nestedCategories?.length > 0 && (
          <FilterSection title='Categories'>
            <FormGroup row>
              <div className='space-y-3'>
                {reawFilterData.nestedCategories.map(category => (
                  <div key={category._id}>
                    <div className='flex items-center gap-2'>
                      <CustomCheckboxLabel
                        id={`category-${category._id}`}
                        label={category.name}
                        name='categories'
                        onChange={() => handleCheckboxChange('categories', category._id)}
                      />
                    </div>
                    {category.children?.length > 0 && (
                      <div className='pl-6 mt-2 space-y-2'>
                        {category.children.map(subCategory => (
                          <div key={subCategory._id} className='flex items-center gap-2'>
                            <CustomCheckboxLabel
                              id={`subcategory-${subCategory._id}`}
                              label={subCategory.name}
                              name='categories'
                              onChange={() => handleCheckboxChange('categories', subCategory._id)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </FormGroup>
          </FilterSection>
        )}

        {/* Dynamic Attributes */}
        {reawFilterData?.productAttributes?.map(attribute => (
          <FilterSection key={attribute._id} title={`Filter By ${attribute.name}`}>
            <div className='space-y-2'>
              {attribute.variations.map(variation => (
                <div key={variation._id} className='flex items-center gap-2'>
                  <CustomCheckboxLabel
                    id={`${attribute.slug}-${variation._id}`}
                    label={`${variation.metaValue}${variation.measurementUnit?.symbol ? ` (${variation.measurementUnit.symbol})` : ''}`}
                    name={attribute.slug}
                    checked={filter.attributeVariations?.includes(variation._id)} // ensure single selection reflects visually
                    onChange={() => handleCheckboxChange(attribute.slug, variation._id, 'attributeVariations')}
                  />
                </div>
              ))}
            </div>
          </FilterSection>
        ))}

        {/* Price */}
        <div className='px-4'>
          <FilterSection title='Filter By Price'>
            <div className='px-0'>
              <div className='flex items-center justify-between mt-4 mb-4 text-sm'>
                <span>£{priceRange[0]}</span>
                <span>£{priceRange[1]}</span>
              </div>
              <Slider
                value={priceRange}
                onChange={(event, newValue) => setPriceRange(newValue)} // Only update local state while dragging
                onChangeCommitted={(event, newValue) => {
                  // Update the filter when user drops the slider
                  setFilter(prev => ({
                    ...prev,
                    minPriceB2B: newValue[0],
                    maxPriceB2B: newValue[1]
                  }))
                }}
                valueLabelDisplay='auto'
                min={10}
                max={5780}
                sx={{ color: '#991b1b' }}
              />
            </div>
          </FilterSection>
        </div>

        {/* Suppliers */}
        {reawFilterData?.suppliers?.length > 0 && (
          <FilterSection title='Manufacturer'>
            <div className='space-y-2'>
              {reawFilterData.suppliers.map(supplier => (
                <div key={supplier._id} className='flex items-center gap-2'>
                  <CustomCheckboxLabel
                    id={`supplier-${supplier._id}`}
                    label={supplier.companyName}
                    name='supplier'
                    checked={filter.supplier === supplier._id}
                    onChange={() => handleCheckboxChange('supplier', supplier._id)}
                  />
                </div>
              ))}
            </div>
          </FilterSection>
        )}
      </div>
      <div className='flex gap-2 mt-4 justify-center'>
        {/* <Button
            variant='contained'
            size=''
            className='bg-red-800 hover:bg-black capitalize border-0 text-white px-4 py-2 rounded-md flex items-center gap-2 font-montserrat'
          >
            Apply Filter
          </Button> */}
        <Button
          variant='outlined'
          color='secondary'
          size=''
          onClick={() => {
            // Reset the filter state
            setFilter({
              search_string: '',
              categories: [],
              supplier: [],
              attributeVariations: [],
            })

            // Reset the price range state
            setPriceRange([10, 10000]) // or whatever your default range is
          }}
          className='border-gray-400 text-black capitalize font-montserrat'
        >
          <i className='ri-close-line text-16 me-1'></i> Clear
        </Button>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <>
        <Drawer
          anchor='left'
          open={isOpen}
          onClose={onClose}
          sx={{
            '& .MuiDrawer-paper': {
              width: { xs: 300, sm: 350 }
            }
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box display='flex' justifyContent='space-between' alignItems='center'>
              <Typography variant='h6'>Filters</Typography>
              <IconButton onClick={onClose}>
                <i className='ri-close-line'></i>
              </IconButton>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ overflowY: 'auto' }}>{filterContent}</Box>
          </Box>
        </Drawer>
      </>
    )
  }

  return (
    <div className=' w-72 shrink-0'>
      <div className='flex gap-2 mt-4 justify-between'>
        <h3 className='text-xl text-redText font-medium mb-4'>Filters</h3>
        {/* <div className=''>
          <Button
            variant='outlined'
            color='secondary'
            size=''
            onClick={() => {
              setFilter({
                search_string: '',
                categories: [],
                supplier: [],
                attributeVariations: [],
                price: []
              })
              setPriceRange([10, 10000])
            }}
            className='border-gray-400 text-black capitalize font-montserrat'
          >
            <i className='ri-close-line text-16 me-1'></i> Clear
          </Button>
        </div> */}
      </div>
      {filterContent}
    </div>
  )
}
