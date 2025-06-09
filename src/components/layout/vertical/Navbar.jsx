// Component Imports
import LayoutNavbar from '@layouts/components/vertical/Navbar'
import NavbarContent from './NavbarContent'
import { useDispatch, useSelector } from 'react-redux';

const Navbar = () => {
  return (
    <LayoutNavbar>
      <NavbarContent />
    </LayoutNavbar>
  )
}

export default Navbar
