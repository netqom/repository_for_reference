"use client"
import Image from "next/image"
import Link from "next/link"
import {ChevronRight, Search, ShoppingCart, User, Menu} from "lucide-react"
import { useEffect, useState } from "react"
import '@/styles/globals.css' // adjust path if needed
import CartSidebar from "./cart-sidebar"

export default function Header() {

  const [cartOpen, setCartOpen] = useState(false)
     useEffect(() => {
        // Search functionality
        const searchTrigger = document.querySelector(".search-trigger")
        const searchOverlay = document.querySelector(".search-overlay")
        const closeSearch = document.querySelector(".search-overlay button")
    
        if (searchTrigger && searchOverlay && closeSearch) {
          searchTrigger.addEventListener("click", () => {
            searchOverlay.classList.remove("hidden")
            searchOverlay.classList.add("flex")
          })
    
          closeSearch.addEventListener("click", () => {
            searchOverlay.classList.add("hidden")
            searchOverlay.classList.remove("flex")
          })
        }
    
        // Mobile menu
        const menuTrigger = document.querySelector(".menu-trigger")
        const mobileMenu = document.querySelector(".mobile-menu")
        const mobileMenuClose = document.querySelector(".mobile-menu-close")
        const mobileMenuContent = document.querySelector(".mobile-menu > div")
    
        if (menuTrigger && mobileMenu && mobileMenuClose && mobileMenuContent) {
          menuTrigger.addEventListener("click", () => {
            mobileMenu.classList.remove("hidden")
            mobileMenu.classList.add("flex")
            setTimeout(() => {
              mobileMenuContent.classList.remove("translate-x-[-100%]")
            }, 10)
          })
    
          mobileMenuClose.addEventListener("click", () => {
            mobileMenuContent.classList.add("translate-x-[-100%]")
            setTimeout(() => {
              mobileMenu.classList.add("hidden")
              mobileMenu.classList.remove("flex")
            }, 300)
          })
    
          mobileMenu.addEventListener("click", (e) => {
            if (e.target === mobileMenu) {
              mobileMenuContent.classList.add("translate-x-[-100%]")
              setTimeout(() => {
                mobileMenu.classList.add("hidden")
                mobileMenu.classList.remove("flex")
              }, 300)
            }
          })
        }
    
        // Mobile submenu
        const mobileSubmenuTriggers = document.querySelectorAll(".mobile-submenu-trigger")
        mobileSubmenuTriggers.forEach((trigger) => {
          trigger.addEventListener("click", () => {
            const submenu = trigger.nextElementSibling
            submenu.classList.toggle("hidden")
            const icon = trigger.querySelector("svg")
            icon.classList.toggle("rotate-90")
          })
        })
    
        // Account dropdown
        const accountTrigger = document.querySelector(".account-trigger")
        const accountDropdown = document.querySelector(".account-dropdown")
    
        if (accountTrigger && accountDropdown) {
          accountTrigger.addEventListener("click", () => {
            accountDropdown.classList.toggle("hidden")
          })
    
          document.addEventListener("click", (e) => {
            if (!accountTrigger.contains(e.target) && !accountDropdown.contains(e.target)) {
              accountDropdown.classList.add("hidden")
            }
          })
        }
    
      
    
        return () => {
          if (searchTrigger && closeSearch) {
            searchTrigger.removeEventListener("click", () => { })
            closeSearch.removeEventListener("click", () => { })
          }
          clearInterval(autoSlideInterval)
          if (sliderPrev && sliderNext) {
            sliderPrev.removeEventListener("click", () => { })
            sliderNext.removeEventListener("click", () => { })
          }
          sliderDots.forEach((dot) => {
            dot.removeEventListener("click", () => { })
          })
          if (productPrev && productNext) {
            productPrev.removeEventListener("click", () => { })
            productNext.removeEventListener("click", () => { })
          }
          if (menuTrigger && mobileMenuClose) {
            menuTrigger.removeEventListener("click", () => { })
            mobileMenuClose.removeEventListener("click", () => { })
          }
          if (accountTrigger) {
            accountTrigger.removeEventListener("click", () => { })
          }
          document.removeEventListener("click", () => { })
        }
        
      }, [])

      
  return (
    <>
      <header className="bg-darkGrey text-white py-6">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              <Image
                src="/logo-white.png"
                alt="Luxury living room with tile flooring"
                width={211}
                height={21}
                className="object-cover w-full h-full brightness-100 w-[150px] md:w-[211px]"
              />
            </Link>
          </div>
          
          <div className="headRight flex">
          <nav className="hidden md:flex space-x-6 text-sm">
            <Link href="/" className="hover:text-gray-300">
              Home
            </Link>
            <div className="relative group">
              <button className="flex items-center hover:text-gray-300">
                Products <ChevronRight className="h-4 w-4 ml-1 transform rotate-90" />
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                <Link href="/products/kitchen" className="block px-4 py-2 text-sm hover:bg-gray-100">
                  Kitchen Tiles
                </Link>
                <Link href="/products/bathroom" className="block px-4 py-2 text-sm hover:bg-gray-100">
                  Bathroom Tiles
                </Link>
                <Link href="/products/living" className="block px-4 py-2 text-sm hover:bg-gray-100">
                  Living Room Tiles
                </Link>
                <Link href="/products/outdoor" className="block px-4 py-2 text-sm hover:bg-gray-100">
                  Outdoor Tiles
                </Link>
              </div>
            </div>
            <Link href="/about" className="hover:text-gray-300">
              About Us
            </Link>
            <Link href="/faq" className="hover:text-gray-300">
              FAQ's
            </Link>
            <Link href="/contact" className="hover:text-gray-300">
              Contact 
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="md:hidden menu-trigger">
              <Menu className="h-6 w-6" />
            </button>
            <button className="search-trigger">
              <Search className="h-5 w-5" />
            </button>
            
            <button className="text-white hover:text-gray-300 relative" onClick={() => setCartOpen(true)}>
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 bg-red-800 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>
            <div className="relative">
              <button className="flex items-center account-trigger">
                <User className="h-5 w-5" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden account-dropdown">
                <Link href="/account" className="block px-4 py-2 text-xs text-gray-700 hover:bg-redText hover:text-white">
                  My Account
                </Link>
                <Link href="/orders" className="block px-4 py-2 text-xs text-gray-700 hover:bg-redText hover:text-white">
                  My Orders
                </Link>
                <Link href="/logout" className="block px-4 py-2 text-xs text-gray-700 hover:bg-redText hover:text-white">
                  Logout
                </Link>
              </div>
            </div>
          </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className="mobile-menu fixed inset-0 bg-darkGrey bg-opacity-50 z-50 hidden">
        <div className="bg-white text-black h-full w-80 max-w-full transform transition-transform duration-300 translate-x-[-100%]">
          <div className="flex justify-between items-center p-4 border-b">
            <Link href="/" className="text-xl font-bold">
              <Image
                src="/logo-white.png"
                alt="Luxury living room with tile flooring"
                width={211}
                height={21}
                className="object-cover w-full h-full brightness-100"
              />
            </Link>
            <button className="mobile-menu-close">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <ul className="space-y-4">
              <li>
                <Link href="/" className="block py-2 text-lg">
                  Home
                </Link>
              </li>
              <li>
                <button className="flex items-center justify-between w-full py-2 text-lg mobile-submenu-trigger">
                  Products
                  <ChevronRight className="h-5 w-5" />
                </button>
                <ul className="pl-4 mt-2 space-y-2 hidden mobile-submenu">
                  <li>
                    <Link href="/products/kitchen" className="block py-1">
                      Kitchen Tiles
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/bathroom" className="block py-1">
                      Bathroom Tiles
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/living" className="block py-1">
                      Living Room Tiles
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/outdoor" className="block py-1">
                      Outdoor Tiles
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link href="/about" className="block py-2 text-lg">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="block py-2 text-lg">
                  FAQ's
                </Link>
              </li>
              <li>
                <Link href="/contact" className="block py-2 text-lg">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <div className="search-overlay fixed inset-0 bg-white z-50 flex-col items-center justify-start pt-20 px-4 hidden">
        <button className="absolute top-4 right-4 text-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="w-full max-w-4xl mx-auto">
          <div className="relative">
            <input type="text" placeholder="Search for products..." className="w-full border-b-2 border-gray-300 py-4 px-2 text-xl focus:outline-none focus:border-red-800"
            />
            <button className="absolute right-0 top-0 h-full px-4 text-red-800">
              <Search className="h-6 w-6" />
            </button>

          
          </div>
        </div>
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
