// @ts-nocheck
"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"

import { BASE_URL } from "@/config/address"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BotCard } from "@/components/BotCard"

import sendTelegramMessage from "../../actions/welcome"
import { InvestorCard } from "../../components/investors/InvestorCard"
import dynamic from "next/dynamic"


const InvestmentStrategyType = dynamic(() => import('@/components/Investment-type/InvestmentCategory'), {
    loading: () => <div className="flex min-h-screen items-center justify-center">Loading...</div>,
});

export default function InvestmentTypePage() {
    return (
        <InvestmentStrategyType />
    )
}
