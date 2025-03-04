import React from "react";
import { BrowserRouter, Routes, Route,Navigate, Link } from "react-router-dom";

import Layout from "./components/Layout";
import Nav from "./components/nav";
export const App = () =>{

    // Render the protected routes if authenticated
  

    return (
      <div>
        <Routes>

          <Route element={<Layout />}>
          <Route index element={<Nav />} />
         
          </Route>
        </Routes>
      </div>
    );
  
}


