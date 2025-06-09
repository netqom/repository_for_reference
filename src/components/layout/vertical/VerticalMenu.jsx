// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// import { GenerateVerticalMenu } from '@components/GenerateMenu'
// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

import { useSession } from 'next-auth/react'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale } = params
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const { data: session } = useSession()
  const user = session?.user
  const roles = user?.roles || []
  const roleId = !roles.length ? '' : roles[0]?._id
  //// console.log('useruseruser', roleId);
  const role =
    roleId == '680f110aa6224872fab09569' || roleId == '680f606cb47c317ad30841b5' ? 'admin' : 'trade-professional'
  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 10 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuSection label={'Pages'}>
          {/* Dashboard For Admin and Team Member*/}
          {roleId !== '' && (roleId == '680f110aa6224872fab09569' || roleId == '680f606cb47c317ad30841b5') && (
            <>
              <MenuItem
                href={`/${locale}/${role}/dashboards/crm`}
                exactMatch={false}
                activeUrl='/admin/dashboards/crm'
                icon={<i className='ri-home-smile-line' />}
              >
                Dashboard
              </MenuItem>

              {roleId !== '' && roleId === '680f110aa6224872fab09569' && (
                <MenuItem
                  href={`/${locale}/admin/team-members/list`}
                  exactMatch={false}
                  activeUrl='/admin/team-members/list'
                  icon={<i className='ri-team-fill' />}
                >
                  Team Management
                </MenuItem>
              )}

              <MenuItem
                href={`/${locale}/admin/supplier/list`}
                exactMatch={false}
                activeUrl='/admin/supplier/list'
                icon={<i className='ri-store-3-line'></i>}
              >
                Supplier Management
              </MenuItem>

              <MenuItem
                href={`/${locale}/admin/tax/list`}
                exactMatch={false}
                activeUrl='/admin/tax/list'
                icon={<i className='ri-money-dollar-box-line'></i>}
              >
                Tax Management
              </MenuItem>
              <MenuItem
                href={`/${locale}/admin/trade-professionals/list`}
                exactMatch={false}
                activeUrl='/admin/trade-professionals/list'
                icon={<i className='ri-team-fill' />}
              >
                Trade Professionals
              </MenuItem>
              <SubMenu label={dictionary['navigation'].eCommerce} icon={<i className='ri-shopping-bag-3-line' />}>
                <SubMenu label={dictionary['navigation'].products}>
                  <MenuItem href={`/${locale}/admin/ecommerce/products/list`}>Product Management</MenuItem>
                  <MenuItem href={`/${locale}/admin/ecommerce/products/category/list`}>Category Management</MenuItem>
                  <MenuItem href={`/${locale}/admin/ecommerce/products/attribute`}>Attribute Management</MenuItem>
                </SubMenu>
              </SubMenu>
            </>
          )}
          {/*End Dashboard For Admin and Team Member*/}

          {/* Dashboard For Trade Professional*/}
          {roleId !== '' && roleId == '6819ce06bb8f30e6c73eba48' && (
            <>
              <MenuItem
                href={`/${locale}/trade-professional/dashboard`}
                exactMatch={false}
                activeUrl='/trade-professional/dashboard'
                icon={<i className='ri-home-smile-line' />}
              >
                Dashboard
              </MenuItem>
              <MenuItem
                href={`/${locale}/trade-professional/client/list`}
                exactMatch={false}
                activeUrl='/trade-professional/client/list'
                icon={<i className='ri-group-fill' />}
              >
                Client
              </MenuItem>
              <MenuItem
                href={`/${locale}/${role}/orders/list`}
                exactMatch={false}
                activeUrl={`/${role}/orders/list`}
                icon={<i className='ri-store-3-line'></i>}
              >
                Orders
              </MenuItem>
            </>
          )}
          {/*End Dashboard For Trade Professional*/}

          <MenuItem
            href={`/${locale}/${role}/support-tickets/list`}
            exactMatch={false}
            activeUrl={`/${role}/support-tickets/list`}
            icon={<i className='ri-store-3-line'></i>}
          >
            Support tickets
          </MenuItem>
        </MenuSection>

        {/* End Trade Professional Menus */}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
