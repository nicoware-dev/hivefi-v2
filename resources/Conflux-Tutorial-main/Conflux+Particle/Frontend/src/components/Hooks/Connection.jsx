import { useEthereum, useConnect, useAuthCore } from '@particle-network/auth-core-modal';
import { Avalanche ,AvalancheTestnet, ConfluxeSpaceTestnet} from '@particle-network/chains';
import { AAWrapProvider, SendTransactionMode, SmartAccount } from '@particle-network/aa';
import { ethers } from 'ethers';
import { notification } from 'antd';
import React, { useState, useEffect, useContext, useMemo } from "react";
// import './App.css';



const ConfluxContext = React.createContext({
  ownerAddress: undefined,
  accountAddress: undefined,
  provider: undefined,
  handleLogin: undefined,
  userInfo: undefined,
  loading: undefined,
  Logout: undefined,
  balance: undefined,
});


export const UseParticle = () => {
  return useContext(ConfluxContext);
};

export const ConfluxProvider = ({ children }) => {


   const [loading, setLoading] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState(null);
  const [userInfo1, setUserInfo] = useState(null);
  const [providerState, setProviderState] = useState(null);


  const [accountAddress, setAccountAddress] = useState(null);


  const { provider,address } = useEthereum();
  const { connect, disconnect } = useConnect();
  const { userInfo } = useAuthCore();


  const smartAccount = new SmartAccount(provider, {
    projectId: "Your Project id",
    clientKey: "Your clinet key",
    appId: "Your App id",
    aaOptions: {
      accountContracts: {
        SIMPLE: [{ chainIds: [ConfluxeSpaceTestnet.id], version: '1.0.0' }] // Or BICONOMY, LIGHT, CYBERCONNECT
      }
    }
  });

  const customProvider = new ethers.providers.Web3Provider(provider, "any");


  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (userInfo) {
      fetchBalance();
    }
  }, [userInfo, smartAccount, customProvider]);

  const fetchBalance = async () => {

  
    // const address = await userInfo.getAddress();

    console.log(address)
    const balanceResponse = await customProvider.getBalance(address);

    // alert(ethers.utils.formatEther(balanceResponse))
    setBalance(ethers.utils.formatEther(balanceResponse));
    localStorage.setItem("smartbal",ethers.utils.formatEther(balanceResponse));

   
    setAccountAddress(address);
    localStorage.setItem("filWalletAddress",address)
    
    console.log(ethers.utils.formatEther(balanceResponse))
  };

  const handleLogin = async (authType) => {
    setLoading(true);
    if (!userInfo) {
      await connect({
        socialType: authType,
        chain: ConfluxeSpaceTestnet,
      });
    }
    setLoading(false);
  };

  const  Logout = async  () => {
    await disconnect();
     
        
      };



  return (
        <ConfluxContext.Provider
      value={{
        ownerAddress: ownerAddress,
        accountAddress: accountAddress,
        provider: customProvider,
        userInfo: userInfo,
        handleLogin,
        loading,
        Logout,
        balance,
      }}
    >
      {children}
    </ConfluxContext.Provider>
  );
   
};