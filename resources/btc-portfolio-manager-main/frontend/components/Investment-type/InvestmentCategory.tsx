
import React, { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';
import BasketCard from './BasketCard';
import { useBasket } from '@/context/BasketContext';
import { RunesPriceList } from './price';

type BTSDataType = {
    tvl: { usd: string }
    all_time_performance: number
    "24hourVolume": number
    "24hourPriceChange": number
    amount: string
    total_supply: string
}

const InvestmentCategory = () => {

    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [basketOfRunes, setBasketOfRunes] = useState<any[]>([])

    const { basketData, setBasketData } = useBasket();

    const createBaskets = (data) => {
        const baskets = [];
        const noOfRunesInObject = 4
        for (let i = 0; i < data.length; i += noOfRunesInObject) {

            const basketId = Math.floor(i / noOfRunesInObject) + 1
            const basket = {
                id: basketId,
                name: `Basket ${Math.floor(i / noOfRunesInObject) + 1}`,
                runes: data.slice(i, i + noOfRunesInObject)
            };
            baskets.push(basket);
        }
        console.log("Baskets >>>", baskets)
        setIsLoading(false);
        setBasketOfRunes(baskets)
        setBasketData(baskets)
    }

    const fetchRunesList = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('https://open-api.unisat.io/v1/indexer/runes/info-list?start=0&limit=12', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_UNISAT_API_KEY}`
                }
            })
            const response = await res.json()

            console.log("response", response)

            const { detail } = response.data

            console.log("RunesPriceList", RunesPriceList);

            detail.forEach(rune => {
                const priceInfo = RunesPriceList.find(price => price.name === rune.spacedRune);
                if (priceInfo) {
                    rune.priceinusd = priceInfo.priceinusd;
                    rune.sats = priceInfo.sats;
                }
            });

            createBaskets(detail)

        } catch (error) {
            setIsLoading(false);
            console.error("Error fetching BTS data:", error)
        }
    }

    useEffect(() => {
        fetchRunesList();
    }, [])

    return (
        <div className="flex flex-col gap-8 px-20 py-8">
            <div>
                <h5 className="text-[24px] font-[700]">INVEST</h5>
                <h1 className="text-3xl font-bold">Basket of Runes</h1>
                <p className="text-[12px] font-[700] text-[#C3C3C3]">
                    Choose your investor type
                </p>
            </div>

            {isLoading ? (
                <div className="flex min-h-screen items-center justify-center">Loading...</div>
            ) : (
                <BasketCard basket={basketOfRunes} />
            )}

        </div>
    );
};

export default InvestmentCategory;