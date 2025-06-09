import { useState } from 'react';
import Image from 'next/image';
import Badge from '@mui/material/Badge';
import classnames from 'classnames';
import { useKeenSlider } from 'keen-slider/react';
import { calculateTierValue } from '@/components/common/helper';

const ProductVariationView = ({ variation }) => {
  // console.log(variation, "variationvariation");
    if (!variation) return null;

    const images = variation.variationImages || [];

    const [loaded, setLoaded] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const [sliderRef, instanceRef] = useKeenSlider({
        slideChanged(slider) {
            setCurrentSlide(slider.track.details.rel);
        },
        created() {
            setLoaded(true);
        }
    });



    return (
        <>
            <div className='navigation-wrapper relative'>
                <div ref={sliderRef} className='keen-slider'>
                    {images.map((img, index) => (
                        <div key={index} className='keen-slider__slide'>
                            <div style={{ position: 'relative', width: '100%', height: 300 }}>
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${img.filePath}`}
                                    alt={`Variation Image ${index + 1}`}
                                    fill
                                    style={{ objectFit: 'contain', borderRadius: 8 }}
                                    sizes="(max-width: 768px) 100vw, 300px"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {loaded && instanceRef.current && (
                    <>
                        <i
                            className={classnames(
                                'ri-arrow-left-s-line absolute top-1/2 w-12 h-12 cursor-pointer text-white transform -translate-y-1/2 left-2',
                                {
                                    'opacity-50 pointer-events-none': currentSlide === 0
                                }
                            )}
                            onClick={e => {
                                e.stopPropagation();
                                instanceRef.current?.prev();
                            }}
                        />

                        <i
                            className={classnames(
                                'ri-arrow-right-s-line absolute top-1/2 w-12 h-12 cursor-pointer text-white transform -translate-y-1/2 right-2',
                                {
                                    'opacity-50 pointer-events-none':
                                        currentSlide === instanceRef.current.track.details.slides.length - 1
                                }
                            )}
                            onClick={e => {
                                e.stopPropagation();
                                instanceRef.current?.next();
                            }}
                        />
                    </>

                )}
            </div>

            <div className="space-y-6 p-4">

                <div
                    key={variation._id}
                    className="p-4 border rounded-md shadow-sm bg-white"
                >
                    <h2 className="text-lg font-medium mb-4 px-5 py-2 rounded-[3px] text-white" style={{ background: 'var(--mui-palette-primary-dark)' }}>
                        Product Name: {variation.product?.name}
                    </h2>

                    <table className="w-full table-auto border-collapse">
                        <tbody>
                            <tr className="border-b">
                                <td className="font-normal text-sm pr-4 py-2 ">Description:</td>
                                <td className="py-2 text-sm">{variation?.description}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="font-normal text-sm pr-4 py-2">Stock Status:</td>
                                <td className="py-2 text-sm">{variation?.stockStatus}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="font-normal text-sm pr-4 py-2">Stock Quantity:</td>
                                <td className="py-2 text-sm">{variation?.stockQuantity}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="font-normal text-sm pr-4 py-2">Allow Backorders:</td>
                                <td className="py-2 text-sm">{variation?.allowBackorders ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="font-normal text-sm pr-4 py-2">Weight:</td>
                                <td className="py-2 text-sm">{variation?.weight}g</td>
                            </tr>
                            <tr className="border-b">
                                <td className="font-normal text-sm pr-4 py-2">Dimensions:</td>
                                <td className="py-2 text-sm">
                                    {variation?.dimensions.length} x {variation?.dimensions.width} x {variation?.dimensions.height}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="font-normal text-sm pr-4 py-2">Regular Price:</td>
                                <td className="py-2 text-sm">${variation?.regularPrice}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="font-normal text-sm pr-4 py-2">Sale Price:</td>
                                <td className="py-2 text-sm">${variation?.salePrice}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="font-normal text-sm pr-4 py-2">Purchased Price:</td>
                                <td className="py-2 text-sm">${variation?.purchasedPrice}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="font-normal text-sm pr-4 py-2">Shipping Class:</td>
                                <td className="py-2 text-sm">{variation?.shippingClass ?? 'N/A'}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="font-normal text-sm pr-4 py-2">Tax Class:</td>
                                <td className="py-2 text-sm">{variation?.taxClass}</td>
                            </tr>
                            <tr>
                                <td colSpan={2} className="font-bold pr-4 py-4 align-top text-center">Tier Pricing:</td>
                            </tr>
                            <tr>
                                <td colSpan={2} className=" text-sm">
                                    <table className="w-full text-sm border border-gray-300 rounded">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="text-left py-1 px-2 border-b">Tier</th>
                                                <th className="text-left py-1 px-2 border-b">Range (sq.m)</th>
                                                <th className="text-left py-1 px-2 border-b">Price (inc. VAT)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="py-1 px-2 border-b">Tier 5</td>
                                                <td className="py-1 px-2 border-b">Under 30</td>
                                                <td className="py-1 px-2 border-b">£{calculateTierValue(variation?.purchasedPrice, 1.17, variation?.tierDiscount?.tierFifth?.tierAddOn, variation?.tierDiscount?.tierFifth?.tierMultiplyBy)}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1 px-2 border-b">Tier 4</td>
                                                <td className="py-1 px-2 border-b">30 - 51</td>
                                                <td className="py-1 px-2 border-b">£{calculateTierValue(variation?.purchasedPrice, 1.17, variation?.tierDiscount?.tierFourth?.tierAddOn, variation?.tierDiscount?.tierFourth?.tierMultiplyBy)}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1 px-2 border-b">Tier 3</td>
                                                <td className="py-1 px-2 border-b">51 - 153</td>
                                                <td className="py-1 px-2 border-b">£{calculateTierValue(variation?.purchasedPrice, 1.17, variation?.tierDiscount?.tierThird.tierAddOn, variation?.tierDiscount?.tierThird.tierMultiplyBy)}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1 px-2 border-b">Tier 2</td>
                                                <td className="py-1 px-2 border-b">153 - 1300</td>
                                                <td className="py-1 px-2 border-b">£{calculateTierValue(variation?.purchasedPrice, 1.17, variation?.tierDiscount?.tierSecond?.tierAddOn, variation?.tierDiscount?.tierSecond?.tierMultiplyBy)}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1 px-2">Tier 1</td>
                                                <td className="py-1 px-2">Over 1300</td>
                                                <td className="py-1 px-2 border-b">£{calculateTierValue(variation?.purchasedPrice, 1.17, variation?.tierDiscount?.tierFirst?.tierAddOn, variation?.tierDiscount?.tierFirst?.tierMultiplyBy)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>

            {loaded && instanceRef.current && (
                <div className='swiper-dots'>
                    {[...Array(instanceRef.current.track.details.slides.length).keys()].map(idx => (
                        <Badge
                            key={idx}
                            variant='dot'
                            component='div'
                            className={classnames({ active: currentSlide === idx })}
                            onClick={() => instanceRef.current?.moveToIdx(idx)}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

export default ProductVariationView;
