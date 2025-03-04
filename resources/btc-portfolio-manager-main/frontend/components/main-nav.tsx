import * as React from "react"
import Link from "next/link"

import { NavItem } from "@/types/nav"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

// Currency formatter
const currency = {
  short: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Logo components
const StxLogo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
      fill="#5546FF"
    />
    <path
      d="M15.0355 15.6582H8.96448L7.99996 17.5837H16L15.0355 15.6582Z"
      fill="white"
    />
    <path
      d="M12.0001 6.41626L8.96448 12.2674H15.0357L12.0001 6.41626Z"
      fill="white"
    />
  </svg>
)

const BtcLogo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
      fill="#F7931A"
    />
    <path
      d="M17.147 10.4798C17.3959 8.83122 16.1553 7.91327 14.4806 7.30772L15.0894 5.23624L13.8318 4.91095L13.2371 6.92624C12.9059 6.84389 12.5653 6.76624 12.2271 6.69095L12.8271 4.66154L11.5694 4.33624L10.9606 6.40772C10.6859 6.34624 10.4159 6.28477 10.1553 6.22095V6.21389L8.41765 5.77095L8.07059 7.11389C8.07059 7.11389 9.00706 7.32624 8.98588 7.34036C9.51529 7.47095 9.61059 7.82507 9.59412 8.10742L8.90588 10.4798C8.94353 10.4892 8.99294 10.5033 9.04941 10.5269C9.00235 10.5151 8.95294 10.5033 8.90353 10.4892L7.93412 13.8386C7.87059 14.0033 7.70824 14.2457 7.34471 14.1574C7.35882 14.1763 6.42941 13.9263 6.42941 13.9263L5.77647 15.3657L7.41765 15.7851C7.72235 15.8627 8.02 15.9451 8.31294 16.0227L7.69765 18.1175L8.95294 18.4428L9.56235 16.3692C9.90706 16.4633 10.2424 16.5504 10.5706 16.6328L9.96353 18.6969L11.2212 19.0222L11.8365 16.9322C14.0835 17.3045 15.8024 17.1516 16.5835 15.1345C17.2153 13.5022 16.6065 12.5745 15.3959 11.9857C16.2894 11.7857 16.9659 11.1845 17.147 10.4798ZM14.1659 14.2998C13.7188 15.9322 11.0024 15.0004 10.1294 14.8051L10.9318 12.0604C11.8047 12.2575 14.6318 12.5863 14.1659 14.2998ZM14.6153 10.4539C14.2071 11.9551 11.9247 11.1516 11.1894 10.9869L11.9153 8.49095C12.6506 8.65564 15.0424 8.87859 14.6153 10.4539Z"
      fill="white"
    />
  </svg>
)

interface MainNavProps {
  items?: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  const [stxPrice, setStxPrice] = React.useState("0.00")
  const [btcPrice, setBtcPrice] = React.useState("0.00")

  // Fetch prices on component mount
  React.useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Fetch BTC price
        const btcResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
        const btcData = await btcResponse.json()
        setBtcPrice(btcData.bitcoin.usd.toString())

        // Fetch STX price
        const stxResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd')
        const stxData = await stxResponse.json()
        setStxPrice(stxData.blockstack.usd.toString())
      } catch (error) {
        console.error('Error fetching prices:', error)
      }
    }

    fetchPrices()
    // Refresh prices every 5 minutes
    const interval = setInterval(fetchPrices, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex gap-6 md:gap-10">
        <Link href="/" className="flex items-center space-x-2">
          <Icons.logo className="size-6" />
          <span className="inline-block font-bold">{siteConfig.name}</span>
        </Link>
        {items?.length ? (
          <nav className="flex gap-6">
            {items?.map(
              (item, index) =>
                item.href && (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "text-muted-foreground flex items-center text-sm font-medium",
                      item.disabled && "cursor-not-allowed opacity-80"
                    )}
                  >
                    {item.title}
                  </Link>
                )
            )}
          </nav>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        <div className="px-4 py-3 border border-border rounded-lg flex items-center gap-1">
          <StxLogo className="w-[14px] h-[14px] shrink-0" />
          <p className="text-sm">
            {currency.short.format(Number(stxPrice))}
          </p>
        </div>
        <div className="px-4 py-3 border border-border rounded-lg flex items-center gap-1">
          <BtcLogo className="w-[14px] h-[14px] shrink-0" />
          <p className="text-sm">
            {currency.short.format(Number(btcPrice))}
          </p>
        </div>
      </div>
    </div>
  )
}
