import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../images/logo.png'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className=" shadow-lg mb-11  text-gray py-3 bg-none bg-center">
      <div className="container mx-auto  px-4 py-2 flex justify-between items-center md:px-0">
      
      <div>
        <img src={logo} 
        className='h-14 mr-3 inline-block'/>
        <div className=" inline-block text-3xl align-middle font-mono font-semibold mr-4">Payoneer</div>
      </div>
      <div className="flex items-center">
        <div className="hidden  md:flex space-x-4">
          <NavItem  to='/'>Dashboard</NavItem>
          <NavItem to='/transfer'>Transfer</NavItem>
          <NavItem to='/transactions'>Transactions</NavItem>
          <NavItem to='/add-money'>Services</NavItem>
          <NavItem to=''>Logout</NavItem>
          <NavItem to='profile'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>

          </NavItem>
        </div>
      </div>

        <div className="md:hidden flex items-center">
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="md:hidden text-xl focus:outline-none"
            >
              ☰
            </button>
            {menuOpen && (
              <div className="md:hidden absolute top-full right-0 mt-2 bg-none rounded-lg shadow-lg w-48">
                <div className="py-3">
                  <MobileNavItem onCloseMenu={() => setMenuOpen(false)}>Dashboard</MobileNavItem>
                  <MobileNavItem onCloseMenu={() => setMenuOpen(false)}>Services</MobileNavItem>
                  <MobileNavItem onCloseMenu={() => setMenuOpen(false)}>Transactions</MobileNavItem>
                  <MobileNavItem onCloseMenu={() => setMenuOpen(false)}>Logout</MobileNavItem>
                  <MobileNavItem onCloseMenu={() => setMenuOpen(false)}>Profile</MobileNavItem>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};

const NavItem = ({ children, to, hoverClass }) => {
  return (
    <NavLink to={to} className={`px-1 lg:px-2 font-medium align-middle text-md text-gray-600 hover:text-bold hover:text-orange-500 '}`}>
      {children}
    </NavLink>
  );
};

const MobileNavItem = ({ children , to, onCloseMenu }) => {
  return (
    <NavLink
      to={to}
      onClick={onCloseMenu}
      className="cursor-pointer block px-4 py-2 text-sm hover:bg-gray-600"
    >
      {children}
    </NavLink>
  );
};

export default Navbar;
