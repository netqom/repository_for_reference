import Image from 'next/image';
import Link from 'next/link';
import Button from '@mui/material/Button';

export default function ProductGrid({ products }) {

  // console.log(products, 'productsproducts');

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {products?.map((product, index) => (
        <div key={`${product?.variationId}`} className='group'>
          {/* <Link href={`/products/${product?.id}?vid=${product?.variationId}`}> */}
          <Link href={`/products/${product?.id}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <div className='p-2 bg-bgLight rounded-lg mb-3'>
              <div className='relative aspect-square overflow-hidden rounded-md'>
                <Image
                  src={
                    product?.avatar && product?.avatar.trim()
                      ? `${process?.env?.NEXT_PUBLIC_BACKEND_DOMAIN}${product?.avatar}`
                      : '/placeholder.svg'
                  }
                  alt={product?.name || 'Product'}
                  fill
                  className='object-cover group-hover:scale-105 transition-transform duration-300'
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={index < 6} // Optional performance improvement
                />
              </div>
            </div>
          </Link>
          <div className='text-center'>
            <Link href={`/products/${product?.id}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <h3 className='font-normal text-16'>{product?.name}</h3>
              <p className='text-red-800 my-1'>£{product?.price ? parseFloat(product?.price).toFixed(2) : '0.00'}</p>
            </Link>
            <div className='flex justify-center items-center gap-1 my-2'>
              {[1, 2, 3, 4, 5].map(i => (
                <i
                  key={i}
                  className={`ri-star-fill h-4 w-4 ${i <= product?.rating ? 'text-red-800' : 'text-gray-200'}`}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
