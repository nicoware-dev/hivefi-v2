import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import { ToastContainer } from 'react-toastify';


import Nav from "./nav";
const Layout = () => {
  return (
    
    <div>
 
      <ToastContainer/>
      <Outlet />
    </div>  
    
  );
};

export default Layout;