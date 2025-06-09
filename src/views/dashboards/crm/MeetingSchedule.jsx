// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'
import { Button } from '@mui/material';

// Vars
const data = [
  {
    promotionID : 'PROMO001',
    avatarSrc: '/images/promotions/summer_sale_promotion.png',
    title: 'Summer Sale',
    subtitle: '21 Jul | 08:20-10:30',
    chipLabel: 'Business',
    chipColor: 'primary',
    startDate : 'May 28th 2025',
    endDate : 'Oct 28th 2025',
    type : 'Flat'
  },
  {
    promotionID : 'PROMO002',
    avatarSrc: '/images/promotions/trade_pro_promotion.png',
    title: 'Trade Pro Special',
    subtitle: '24 Jul | 11:30-12:00',
    chipLabel: 'Meditation',
    chipColor: 'success',
    startDate : 'May 28th 2025',
    endDate : 'Oct 28th 2025',
    type : 'Percentage'
  },
  {
    promotionID : 'PROMO003',
    avatarSrc: '/images/promotions/flash_deal_friday.png',
    title: 'Flash Deal Friday',
    subtitle: '28 Jul | 05:00-6:45',
    chipLabel: 'Dinner',
    chipColor: 'primary',
    startDate : 'May 28th 2025',
    endDate : 'Oct 28th 2025',
    type : 'Flat'
  },
  {
    promotionID : 'PROMO004',
    avatarSrc: '/images/promotions/clearance_bonanza.jpg',
    title: 'Clearance Bonanza',
    subtitle: '03 Aug | 07:00-8:30',
    chipLabel: 'Meetup',
    chipColor: 'success',
    startDate : 'May 28th 2025',
    endDate : 'Oct 28th 2025',
    type : 'Percentage'
  },
  {
    promotionID : 'PROMO005',
    avatarSrc: '/images/promotions/welcome_offer.png',
    title: 'Welcome Offer',
    subtitle: '14 Aug | 04:15-05:30',
    chipLabel: 'Dinner',
    chipColor: 'primary',
    startDate : 'May 28th 2025',
    endDate : 'Oct 28th 2025',
    type : 'Flat'
  },
  {
    promotionID : 'PROMO006',
    avatarSrc: '/images/promotions/category_fest.jpg',
    title: 'Category Fest',
    subtitle: '05 Oct | 10:00-12:45',
    chipLabel: 'Business',
    chipColor: 'success',
    startDate : 'May 28th 2025',
    endDate : 'Oct 28th 2025',
    type : 'Percentage'
  }
]

const MeetingSchedule = () => {
  return (
    <Card>
      {/* <CardHeader
        title='Promotions'
        action={<OptionMenu iconClassName='text-textPrimary' options={['Last 28 Days', 'Last Month', 'Last Year']} />}
      ></CardHeader> */}
<div className='flex p-4 justify-between items-center'>
  <h3>Promotions</h3>
      <Button size='small' variant='contained'>
          View All
        </Button>
        </div>

      <CardContent className='flex flex-col gap-[1.71rem]'>
        {data.map((item, index) => (
          <div key={index} className='flex items-center gap-3'>
            <CustomAvatar src={item.avatarSrc} size={38} />

            <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
              <div className='flex flex-col gap-0.5'>
                <Typography color='text.primary' className='font-medium'>
                  {item.title}
                </Typography>
                <div className='flex items-center gap-2'>
                  <i className='ri-calendar-line text-base text-textSecondary' />
                  <Typography variant='body2'>{item.startDate} | {item.endDate}</Typography>
                </div>
              </div>
              <Chip label={item.type} color={item.chipColor} size='small' variant='tonal' />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default MeetingSchedule
