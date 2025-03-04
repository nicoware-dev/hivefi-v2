import React from 'react';
import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from 'next/image';
import Link from 'next/link';

const BasketCard = ({
    basket
}: {
    basket: any[]
}) => {

    console.log("basket", basket)

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-row flex-wrap justify-center gap-4">
                {basket.map((bt) => (
                    <Card key={bt.id} className={`w-[500px] overflow-hidden transition-shadow duration-300 hover:shadow-lg`}> {/* Added hover effect */}
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{bt.name}</span>
                                <Link href={`/strategy/${bt.id}`}>
                                    <Button>
                                        Select
                                    </Button>
                                </Link>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="w-full rounded-md">
                                <div className="flex flex-col gap-4 rounded-lg bg-gray-100 p-4 shadow-md">
                                    {bt.runes.map((rune : any) => (
                                        <div key={rune.runeid} className="flex w-full cursor-pointer flex-col rounded-xl bg-white p-4 shadow-md transition-shadow duration-300 hover:shadow-lg">
                                            <div className='mb-2 flex flex-row items-center gap-2'>
                                                <div className="text-lg font-bold text-gray-800">{rune?.symbol}</div>
                                                <h3 className="text-md font-semibold text-gray-700">{rune?.rune}</h3>
                                            </div>
                                            <div className='flex flex-row items-center gap-2 text-gray-600'>
                                                <div className="font-medium text-blue-600">Price:</div>
                                                <div className="text-gray-800">${rune?.priceinusd?.toLocaleString()}</div>
                                            </div>
                                            <div className='flex flex-row items-center gap-2 text-gray-600'>
                                                <div className="font-medium text-blue-600">Mints:</div>
                                                <div className="text-gray-800">{Number(rune?.mints).toLocaleString()}</div>
                                            </div>
                                            <div className='flex flex-row items-center gap-2 text-gray-600'>
                                                <div className="font-medium text-blue-600">Holder:</div>
                                                <div className="text-gray-800">{rune?.holders?.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default BasketCard;