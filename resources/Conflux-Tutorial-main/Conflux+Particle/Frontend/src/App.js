import React from "react";
import { BrowserRouter, Routes, Route,Navigate, Link } from "react-router-dom";
import { useState,useEffect } from "react";
import Layout from "./components/Layout";
import Nav from "./components/nav";

import { ConfluxProvider } from "./components/Hooks/Connection";
export const App = () =>{

    // Render the protected routes if authenticated
  

    return (
      <ConfluxProvider>
      <div>
        <Routes>

          <Route element={<Layout />}>
         
          <Route index element={<Nav />} />
           
          </Route>
        </Routes>
      </div>
      </ConfluxProvider>
    );
  
}


