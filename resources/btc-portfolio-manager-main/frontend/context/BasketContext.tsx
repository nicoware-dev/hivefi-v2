import React, { createContext, ReactNode, useContext, useState } from 'react';

const BasketContext = createContext<any>(null);

export const BasketProvider = ({ children }: { children: ReactNode }) => {
    const [basketData, setBasketData] = useState([])

    return (
        <BasketContext.Provider value={{
            basketData,
            setBasketData
        }}>
            {children}
        </BasketContext.Provider>
    );
};

export const useBasket = () => {
    return useContext(BasketContext);
};