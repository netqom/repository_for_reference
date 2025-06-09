"use client"

import Image from "next/image"
import Link from "next/link"
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import { useEffect, useState } from "react"
import { Divider, FormControl, Grid2, InputLabel, MenuItem } from "@mui/material"
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import ColorSelector from "./ColorSelector"
import RelatedProductGrid from "./related-product"
import { getProductDetails } from "@/app/server/actions"
import { useParams } from "next/navigation"



// Sample product images
// const productImages = [
//   "/images/pages/slider-img.jpg",
//   "/images/pages/product-img1.jpg",
//   "/images/pages/product-img1.jpg",
//   "/images/pages/product-img1.jpg",
//   "/images/pages/product-img1.jpg",
// ]

export default function ProductDetailPage() {

    const { lang: locale, id: productId } = useParams();
     const [product, setProduct] = useState(null)


  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState("1")
  const [tiles, setTiles] = useState("10")
  const [pallets, setPallets] = useState("1")
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedFinish, setSelectedFinish] = useState("")
  const [pricingTier, setPricingTier] = useState("Tier 5")


  const fetchProductDetails = async () => {
    try {
      const response = await getProductDetails(productId)
      if (response?.success && response?.data) {
        setProduct(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error)
    }
  }

  useEffect(() => {
    if (productId) {
      fetchProductDetails()
    }
  }, [productId])
  const productImages = product?.productImages || ["/images/pages/product-img1.jpg"]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
  }

  const selectImage = (index) => {
    setCurrentImageIndex(index)
  }

  // Update pricing tier based on quantity
  const updatePricingTier = (qty) => {
    const numQty = Number.parseInt(qty) || 0

    if (numQty < 30) {
      setPricingTier("Tier 5")
    } else if (numQty < 75) {
      setPricingTier("Tier 4")
    } else if (numQty < 150) {
      setPricingTier("Tier 3")
    } else if (numQty < 1500) {
      setPricingTier("Tier 2")
    } else {
      setPricingTier("Tier 1")
    }
  }

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value)
    updatePricingTier(e.target.value)
  }

  const [value, setValue] = useState('1')

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const [Tabvalue, setTabValue] = useState('1')

  const handleTab = (event, newValue) => {
    setTabValue(newValue)
  }


  if (!product) {
    return <div>Loading product details...</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}


      <main>


        <div className="container mx-auto px-4 py-8 mt-5">
          <div className="grid md:grid-cols-2 gap-8 mb-5">
            {/* Product Images */}
            <div>
              <div className="mb-4 relative p-4 bg-bgLight rounded-lg">
                <div className="relative aspect-square">
                  <Image
                    src={productImages[currentImageIndex] || "/placeholder.svg"}
                    alt="Travertini Bianco Cross Cut"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full w-[30px] h-[30px] cursor-pointer"
                  onClick={prevImage}
                >
                  {/* <ChevronLeft className="h-5 w-5" /> */}
                  <i className="ri-arrow-left-s-line text-lg"></i>
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full w-[30px] h-[30px] cursor-pointer"
                  onClick={nextImage}
                >
                  {/* <ChevronRight className="h-5 w-5" /> */}
                  <i className="ri-arrow-right-s-line text-lg"></i>
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {productImages.map((image, i) => (
                  <div
                    key={i}
                    className={`border cursor-pointer rounded-md ${currentImageIndex === i ? "ring-2 ring-red-800" : ""}`}
                    onClick={() => selectImage(i)}
                  >
                    <div className="relative aspect-square">
                      <Image src={image || "/placeholder.svg"} alt={`Travertini Bianco Cross Cut Thumbnail ${i + 1}`} fill className="object-cover rounded-md " />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-medium text-red-800">{product.name || "Product Name"}</h1>
              <p className="text-sm text-gray-600">From {product?.supplier?.companyName || 'Suplier'}</p>

              <div className="flex items-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <i key={i} className="ri-star-fill fill-redText text-redText text-lg"></i>
                ))}
                <span className="text-sm text-gray-600 ml-1">3.5k Reviews</span>
              </div>

              <div className="mt-3 mb-4">
                <p className="text-md text-redText mb-3">£{product?.minPriceB2B} - £{product?.maxPriceB2B}/SQ.M</p>
                <p className="flex items-center gap-2 text-sm">
                  <span>Current Stock:</span>
                  <span className="text-green-600 font-medium">580 SQ.M</span>
                </p>
              </div>

              <p className="text-sm text-gray-600 my-4">
                The Timeless Modernity Of Travertine And Its Harmonious Elegance Are Expressed In An Extremely Versatile
                Collection Available In Terms Of Colours.
              </p>

              <div className="my-6">
                <h3 className="font-normal mb-4">Pricing Tiers (inc. Shipping & Duties)</h3>
                <div className=" rounded-md overflow-hidden">
                  <table className="w-full text-sm border border-collapse border-bgLight">
                    <thead className="bg-bgLight">
                      <tr>
                        <th className="px-4 py-2 text-left font-normal text-black">Quantity Range</th>
                        <th className="px-4 py-2 text-left font-normal text-black">Pricing Tier</th>
                        <th className="px-4 py-2 text-left font-normal text-black">Retail Price/SQ.M</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t text-black/50">
                        <td className="px-4 py-2 border-r">Under 30 sq.m</td>
                        <td className="px-4 py-2 border-r">Tier 5</td>
                        <td className="px-4 py-2">£100.00 (inc. VAT)</td>
                      </tr>
                      <tr className="border-t text-black/50">
                        <td className="px-4 py-2 border-r">Under 30 - 75 sq.m</td>
                        <td className="px-4 py-2 border-r">Tier 4</td>
                        <td className="px-4 py-2">£90.00 (inc. VAT)</td>
                      </tr>
                      <tr className="border-t text-black/50">
                        <td className="px-4 py-2 border-r">Under 75 - 153 sq.m</td>
                        <td className="px-4 py-2 border-r">Tier 3</td>
                        <td className="px-4 py-2">£75.00 (inc. VAT)</td>
                      </tr>
                      <tr className="border-t text-black/50">
                        <td className="px-4 py-2 border-r">Under 150 - 1500 sq.m</td>
                        <td className="px-4 py-2 border-r">Tier 2</td>
                        <td className="px-4 py-2">£70.00 (inc. VAT)</td>
                      </tr>
                      <tr className="border-t text-black/50">
                        <td className="px-4 py-2 border-r">Over 1500 sq.m</td>
                        <td className="px-4 py-2 border-r">Tier 1</td>
                        <td className="px-4 py-2">£65.00 (inc. VAT)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="my-6">
                <h3 className="font-normal mb-4">Create Order Here</h3>

                <div>
                  <ColorSelector />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                  <FormControl fullWidth>
                    <InputLabel id='select-size-label'>Select Size</InputLabel>
                    <Select label='Select Size' labelId='select-size-label' id='select-size' defaultValue=''
                      sx={{
                        backgroundColor: '#f4f0ed',
                        borderRadius: '10px',
                        '&:hover .MuiSelect-filled:not(.Mui-disabled)::before': {
                          borderBottom: 'none',
                        },
                        '& .MuiSelect-filled::before': {
                          borderBottom: 'none',
                        },
                        '& .MuiSelect-filled::after': {
                          borderBottom: 'none',
                        },

                      }}
                    >
                      <MenuItem value=''>
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value={10}>Ten</MenuItem>
                      <MenuItem value={20}>Twenty</MenuItem>
                      <MenuItem value={30}>Thirty</MenuItem>
                    </Select>
                  </FormControl>
                  {/*  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="bg-bgLight border-0 focus:ring-0 focus-within:outline-none">
                      <SelectValue placeholder="Select Required Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30x30">30x30 cm</SelectItem>
                      <SelectItem value="60x60">60x60 cm</SelectItem>
                      <SelectItem value="90x90">90x90 cm</SelectItem>
                    </SelectContent>
                  </Select> */}

                  {/* <Select value={selectedFinish} onValueChange={setSelectedFinish}>
                    <SelectTrigger className="bg-bgLight border-0 focus:ring-0 focus-within:outline-none">
                      <SelectValue placeholder="Select Required Finish" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="polished">Polished</SelectItem>
                      <SelectItem value="matte">Matte</SelectItem>
                      <SelectItem value="honed">Honed</SelectItem>
                    </SelectContent>
                  </Select> */}

                  <FormControl fullWidth>
                    <InputLabel id="select-finish-label">Select Finish</InputLabel>
                    <Select
                      label="Select Finish"
                      labelId="select-finish-label"
                      id="select-finish"
                      defaultValue=""
                      sx={{
                        backgroundColor: '#f4f0ed',
                        borderRadius: '10px',
                        '&:hover .MuiSelect-filled:not(.Mui-disabled)::before': {
                          borderBottom: 'none',
                        },
                        '& .MuiSelect-filled::before': {
                          borderBottom: 'none',
                        },
                        '& .MuiSelect-filled::after': {
                          borderBottom: 'none',
                        },

                      }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value={10}>Ten</MenuItem>
                      <MenuItem value={20}>Twenty</MenuItem>
                      <MenuItem value={30}>Thirty</MenuItem>
                    </Select>
                  </FormControl>




                  <div className="bg-bgLight rounded-md px-4 py-2 flex items-center mb-4">
                    <span className="text-sm text-center w-full">{pricingTier}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                  <div className="rounded-md">
                    <input type="text" placeholder="Quantity / Enter SQ.M" className="w-full outline-none h-auto bg-bgLight px-3 py-4 rounded-sm text-sm text-black" onChange={handleQuantityChange} />
                  </div>

                  <div className="rounded-md">
                    <input
                      type="text"
                      className="w-full outline-none h-auto bg-bgLight px-3 py-4 rounded-sm text-sm text-black"
                      onChange={(e) => setTiles(e.target.value)}
                      placeholder="No. Of Tiles"
                    />
                  </div>

                  <div className="rounded-md">

                    <input
                      type="text"
                      className="w-full outline-none h-auto bg-bgLight px-3 py-4 rounded-sm text-sm text-black"
                      value={pallets}
                      onChange={(e) => setPallets(e.target.value)}
                      placeholder="No. Of Pallets"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1 bg-red-800 hover:bg-red-900 text-white">
                    <i className="ri-shopping-cart-line me-2 text-lg"></i>
                    Add To Cart
                  </Button>
                  <Button variant='outlined' className="flex-1 border border-red-800 text-red-800 hover:bg-red-50">
                    <i className="ri-heart-line me-2 text-lg"></i>
                    Add To Wishlist
                  </Button>
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center w-1/2 text-red-800">
                    <i className="ri-box-3-line"></i>
                    <span className="text-darkGrey">Nationwide Delivery Included</span>
                  </div>

                  <div className="flex items-center w-1/2 rounded-sm text-redText bg-redText/25 px-4 py-2">
                    <i className="ri-discount-percent-line me-1"></i>
                    Add 10.08 sq.m more to unlock 5% off
                  </div>
                </div>
              </div>
            </div>
          </div>


          <Divider className="mb-12" />




          <h1 className="text-lg font-semibold text-gray-900 mb-5">Get the Best Deal for I travertini bianco cross cut</h1>


          <Grid2 container spacing={2} className="mb-12">
            <Grid2 size={{ xs: 12, md: 6 }}>
              <div className="bg-slate-50 rounded-2xl border border-red-200 p-3 shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
                <div className="flex gap-4 items-center flex-col md:flex-row">
                  <div className="flex gap-4 items-center w-full">
                    <div className="flex-shrink-0">
                      <div className="w-35 h-35 rounded-lg overflow-hidden ">
                        <Image
                          src={"/images/pages/slider-img.jpg"}
                          alt=""
                          width={124}
                          height={124}
                          className="w-full h-full object-cover align-middle"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 ">
                      <h3 className="font-semibold  text-sm mb-1 leading-tight  text-red-800">Travertini Bianco Cross Cut</h3>
                      <p className="font-normal text-gray-600 text-sm mb-1">Store Name Here</p>

                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <i key={i} className="ri-star-fill fill-redText text-redText text-sm"></i>
                        ))}
                        <span className="text-sm font-normal text-gray-900 ml-1">3.2k Reviews</span>
                      </div>

                      <div className="text-sm font-semibold text-red-800 mb-3">£55.00 - £90.00/SQ.M</div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Button variant="text" className="flex items-center gap-1 text-gray-700 hover:bg-red-800 hover:text-white transition-colors">
                      <span className="text-sm font-medium">Shop Now</span>
                      <i className="ri-arrow-right-s-line text-sm"></i>
                    </Button>
                  </div>
                </div>
              </div>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <div className="bg-slate-50 rounded-2xl border border-red-200 p-3 shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
                <div className="flex gap-4 items-center flex-col md:flex-row">
                  <div className="flex gap-4 items-center w-full">
                  <div className="flex-shrink-0">
                    <div className="w-35 h-35 rounded-lg overflow-hidden ">
                      <Image
                        src={"/images/pages/slider-img.jpg"}
                        alt=""
                        width={124}
                        height={124}
                        className="w-full h-full object-cover align-middle"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 ">
                    <h3 className="font-semibold  text-sm mb-1 leading-tight  text-red-800">Rock Pattern Tiles</h3>
                    <p className="font-normal text-gray-600 text-sm mb-1">Store Name Here</p>

                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <i key={i} className="ri-star-fill fill-redText text-redText text-sm"></i>
                      ))}
                      <span className="text-sm font-normal text-gray-900 ml-1">3.2k Reviews</span>
                    </div>

                    <div className="text-sm font-semibold text-red-800 mb-3">£55.00 - £90.00/SQ.M</div>
                  </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Button variant="text" className="flex items-center gap-1 text-gray-700 hover:bg-red-800 hover:text-white transition-colors">
                      <span className="text-sm font-medium">Shop Now</span>
                      <i className="ri-arrow-right-s-line text-sm"></i>
                    </Button>
                  </div>
                </div>
              </div>
            </Grid2>
          </Grid2>

          <TabContext value={Tabvalue}>
            <TabList
              onChange={handleTab}
              aria-label="simple tabs example"
              TabIndicatorProps={{ style: { display: 'none' } }} // 🔴 This hides the blue bottom line
            >
              <Tab
                value="1"
                label="Additional Information"
                className={
                  `${Tabvalue === '1'
                    ? 'bg-red-800 hover:bg-black text-white [border-top-left-radius:10px] [border-top-right-radius:10px] [border-bottom-left-radius:0] [border-bottom-right-radius:0]'
                    : 'rounded-md'} px-4 py-2 flex items-center gap-2 capitalize font-montserrat text-15`
                }


                disableRipple
                disableFocusRipple
              />
              <Tab
                value="2"
                label="Technical Details"
                className={
                  `${Tabvalue === '2'
                    ? 'bg-red-800 hover:bg-black text-white [border-top-left-radius:10px] [border-top-right-radius:10px] [border-bottom-left-radius:0] [border-bottom-right-radius:0]'
                    : 'rounded-md'} px-4 py-2 flex items-center gap-2 capitalize font-montserrat text-15`
                }
                disableRipple
                disableFocusRipple
              />
              <Tab
                value="3"
                label="Reviews"
                className={
                  `${Tabvalue === '3'
                    ? 'bg-red-800 hover:bg-black text-white [border-top-left-radius:10px] [border-top-right-radius:10px] [border-bottom-left-radius:0] [border-bottom-right-radius:0]'
                    : 'rounded-md'} px-4 py-2 flex items-center gap-2 capitalize font-montserrat text-15`
                }
                disableRipple
                disableFocusRipple
              />
            </TabList>

            <TabPanel value='1' className="border [border-bottom-left-radius:10px] [border-bottom-right-radius:10px]">
              <p className="text-sm leading-relaxed">
                The Timeless Modernity Of Travertine And Its Harmonious Elegance Are Expressed In An Extremely Versatile
                Collection Available In Terms Of Colours, Which Range From Cool Tones To Warmer, Enveloping Nuances.
                Appearance And Surface Variation Travertine Reveals Different Textures Depending On Its Cuts.
              </p>
              <p className="text-sm leading-relaxed mt-4">
                The Cross Cut Technology Reproduces The Cloudy Aesthetics Achieved By Cutting Perpendicular To The
                Direction Of Layering Of The Stone, Resulting In A Homogeneous And Balanced Overall Effect.
              </p>

              <div className="mt-6">
                <h3 className="font-normal mb-2 text-sm">Need A Sample?</h3>
                <p className="text-sm text-gray-600 mb-3">20x20cm Sample Delivered In 3-5 Working Days</p>

                {/* <Select className="mt-4">
                  <SelectTrigger className="max-w-xs w-full md:w-1/4 mt-3 bg-bgLight">
                    <SelectValue placeholder="£9.99 CHOOSE FINISH" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="polished">Polished</SelectItem>
                    <SelectItem value="matte">Matte</SelectItem>
                    <SelectItem value="honed">Honed</SelectItem>
                  </SelectContent>
                </Select> */}

                <FormControl fullWidth className="max-w-xs w-full md:w-1/4 mt-3 bg-bgLight  rounded-md">
                  <InputLabel id='choose-finish-label'>£9.99 CHOOSE FINISH</InputLabel>
                  <Select label='£9.99 CHOOSE FINISH' labelId='choose-finish-label' id='choose-finish' defaultValue=''
                    sx={{
                      backgroundColor: '#f4f0ed',
                      borderRadius: '10px',
                      '&:hover .MuiSelect-filled:not(.Mui-disabled)::before': {
                        borderBottom: 'none',
                      },
                      '& .MuiSelect-filled::before': {
                        borderBottom: 'none',
                      },
                      '& .MuiSelect-filled::after': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <MenuItem value=''>
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value={10}>Polished</MenuItem>
                    <MenuItem value={20}>Matte</MenuItem>
                    <MenuItem value={30}>Honed</MenuItem>
                  </Select>
                </FormControl>

              </div>

              <div className="mt-6">
                <h3 className="font-normal mb-2">High Res Images Pack</h3>

                {/*  <Select className="max-w-xs">
                  <SelectTrigger className="max-w-xs w-full md:w-1/4 mt-3 bg-bgLight">
                    <SelectValue placeholder="DOWNLOAD (5.8MB)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="download">Download Now</SelectItem>
                  </SelectContent>
                </Select> */}

                <FormControl fullWidth className="max-w-xs w-full md:w-1/4 mt-3 bg-bgLight rounded-md">
                  <InputLabel id='download-label'>DOWNLOAD (5.8MB)</InputLabel>
                  <Select label='DOWNLOAD (5.8MB)' labelId='download-label' id='download' defaultValue=''
                    sx={{
                      backgroundColor: '#f4f0ed',
                      borderRadius: '10px',
                      '&:hover .MuiSelect-filled:not(.Mui-disabled)::before': {
                        borderBottom: 'none',
                      },
                      '& .MuiSelect-filled::before': {
                        borderBottom: 'none',
                      },
                      '& .MuiSelect-filled::after': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <MenuItem value=''>
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value={10}>Download Now</MenuItem>
                  </Select>
                </FormControl>

              </div>

            </TabPanel>
            <TabPanel value='2' className="border [border-bottom-left-radius:10px] [border-bottom-right-radius:10px]">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium mb-4 text-redText">Technical Specifications</h3>
                  <ul className="text-sm space-y-4 list-none p-0">
                    <li>
                      <span className="font-medium">Material:</span> Natural Travertine
                    </li>
                    <li>
                      <span className="font-medium">Finish:</span> Polished, Honed, or Matte
                    </li>
                    <li>
                      <span className="font-medium">Thickness:</span> 10mm
                    </li>
                    <li>
                      <span className="font-medium">Sizes Available:</span> 30x30cm, 60x60cm, 90x90cm
                    </li>
                    <li>
                      <span className="font-medium">Water Absorption:</span> &lt;0.5%
                    </li>
                    <li>
                      <span className="font-medium">Slip Resistance:</span> R9
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-4 text-redText">Applications</h3>
                  <ul className="text-sm space-y-4 list-none p-0">
                    <li>Interior Floors</li>
                    <li>Interior Walls</li>
                    <li>Bathroom Floors</li>
                    <li>Bathroom Walls</li>
                    <li>Kitchen Floors</li>
                    <li>Kitchen Backsplashes</li>
                  </ul>
                </div>
              </div>
            </TabPanel>
            <TabPanel value='3' className="border [border-bottom-left-radius:10px] [border-bottom-right-radius:10px]">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <i key={i} className="ri-star-fill fill-redText text-redText"></i>
                  ))}
                </div>
                <span className="text-lg">4.8 out of 5 (126 reviews)</span>
              </div>

              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i key={star} className={`ri-star-fill text-sm ${star <= 5 - (i % 2) ? "fill-redText text-redText" : "fill-gray-200 text-gray-200"}`}></i>
                        ))}
                      </div>
                      <span className="text-sm font-medium">John D.</span>
                      <span className="text-xs text-gray-500">Verified Purchase</span>
                    </div>
                    <p className="text-sm">
                      Beautiful tiles that transformed our bathroom. The quality is excellent and they look even better in
                      person than in the photos.
                    </p>
                  </div>
                ))}
              </div>
            </TabPanel>
          </TabContext>


          <div className="mt-12">
            <h2 className="text-2xl font-medium text-red-800 mb-6 text-center">More Products</h2>
            <RelatedProductGrid />
          </div>
        </div>

      </main>

    </div>
  )
}
