import React from "react";

import { App } from "./App";
import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ReactDOM from "react-dom";
import { Transition } from '@headlessui/react';

import { Avalanche ,AvalancheTestnet,ConfluxeSpaceTestnet} from '@particle-network/chains';
import { AuthCoreContextProvider } from '@particle-network/auth-core-modal';


import('buffer').then(({ Buffer }) => {
  window.Buffer = Buffer;
});

ReactDOM.render(
    <React.StrictMode>
      <AuthCoreContextProvider
      options={{
        pprojectId: "Your Project id",
        clientKey: "Your clinet key",
        appId: "Your App id",
        erc4337: {
          name: 'SIMPLE',
          version: '1.0.0',
        },
        wallet: {
          visible: false,
          customStyle: {
              supportChains: [ConfluxeSpaceTestnet.id],
          }
        }
      }}
    >
  
      <BrowserRouter>
      
        <Routes>
        
          <Route path="*" element={ <App /> }>
          
          </Route>
        </Routes>

       
      </BrowserRouter>
      
      <ToastContainer/>
      <Transition show={true}/>

    </AuthCoreContextProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
  