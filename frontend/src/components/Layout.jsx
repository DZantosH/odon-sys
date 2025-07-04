import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import '../css/PanelPrincipal.css';

const Layout = () => {
  return (
    <div className="App">
      <Navbar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;