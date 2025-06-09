import Image from "next/image"
import Link from "next/link"
import Button from '@mui/material/Button'

const products1 = [
  {
    id: 1,
    name: "Metal Tiles",
    price: 45.0,
    rating: 5,
    image: "/images/pages/product-img4.jpg",
    slug: "product-detail",
  },
  {
    id: 2,
    name: "Rock Pattern Tiles",
    price: 45.0,
    rating: 5,
    image: "/images/pages/product-img4.jpg",
    slug: "../product-detail",
  },
  {
    id: 3,
    name: "BIANCO CROSS CUT",
    price: 45.0,
    rating: 5,
    image: "/images/pages/product-img4.jpg",
    slug: "../product-detail",
  },
  {
    id: 4,
    name: "Metal Tiles",
    price: 45.0,
    rating: 5,
    image: "/images/pages/product-img4.jpg",
    slug: "../product-detail",
  },
]



export default function RelatedProductGrid({ products }) {

  // console.log(products, 'hello');

  if (!products || products.length === 0) {
    return <div>No related products available.</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      {products?.map((product) => {
        const imageSrc = product.productFeaturedImage
          ? `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/${product.productFeaturedImage.filePath}`
          : "/placeholder.svg";
        const price = product.minPriceB2B || 0.0;

        return (
          <>
            <div key={product._id} className="group">
              <Link href={`/products/${product.slug}`} className="block p-2 bg-bgLight rounded-lg mb-3">
                <div className="relative aspect-square overflow-hidden rounded-md">
                  <Image
                    src={imageSrc}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="text-center">
                <Link href={`/products/${product.slug}`} className="block">
                  <h3 className="font-normal text-16">{product.name}</h3>
                  <p className="text-red-800 my-1">£{price}</p>
                </Link>
                <div className="flex justify-center items-center gap-1 my-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <i
                      key={i}
                      className={`ri-star-fill h-4 w-4 ${i <= product.rating ? "text-red-800" : "text-gray-200"}`}
                    />
                  ))}
                </div>
                <div className="flex mt-4 mb-4 justify-center gap-3">
                  <Link href={``} className="hover:no-underline text-sm text-redText underline flex gap-1 hover:text-darkGrey">

                    <i className="ri-box-3-line text-xl"></i>  Add Sample</Link>
                  <Link href={``} className="text-sm hover:no-underline text-redText underline flex gap-1 hover:text-darkGrey">
                    <i className="ri-discount-percent-line text-xl"></i>  Bulk Discounts</Link>
                </div>
                <Link href={`/products/${product?._id}`} className="block mt-4">
                  <Button variant='outlined' className="capitalize border-red-800 !rounded-[4px] text-darkGrey hover:bg-darkGrey hover:text-white hover:border-darkGrey font-montserrat">Add To Cart <i className="ri-shopping-cart-line ms-2 text-16"></i></Button>
                </Link>

              </div>
            </div>

          </>
        );
      })}
    </div>
  )
}
