import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

import { UseParticle } from "./Hooks/Connection";

import Nav from "./nav";
const Layout = () => {
  const {ownerAddress,accountAddress,provider, handleLogin,userInfo,loading,Logout} = UseParticle();


  

  
  
  return (
    
    <div>
      <ToastContainer/>
      <Outlet />
    </div>  
    
  );
};

export default Layout;