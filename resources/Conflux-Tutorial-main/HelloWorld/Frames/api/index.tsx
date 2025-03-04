import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { pinata } from 'frog/hubs'
import { neynar } from 'frog/middlewares'
import { serveStatic } from 'frog/serve-static'
import { handle } from 'frog/vercel'
import { createClient, cacheExchange, fetchExchange } from '@urql/core';
import React, { useState, useEffect } from 'react';

//  9934f29d58e566ad4831b5b7ce3fa39a -> API key for the   BASE
// Base url https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/Fq3tBZDWJ27FM1LpKWvyP9cwuzcXPmoAimTybhVfhf76



// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }



let address: string | null = null;

let balance: Number | null = null;

export const app = new Frog({
  basePath: '/api',
  // Supply a Hub API URL to enable frame verification.
  hub: pinata(),
}).use(
  neynar({
    apiKey: 'NEYNAR_FROG_FM',
    features: ['interactor', 'cast'],
  })
)

app.frame('/', (c) => {
  
  
  const { buttonValue, inputText, status } = c

  

  // return c.error({ message: "Please like and recast..." });


  const fruit = inputText || buttonValue
  return c.res({
    image: (
      <div
      style={{
        alignItems: 'center',
        background:
          status === 'response'
            ? 'linear-gradient(to right, #ff4e5f, #frb47b)' // More colorful gradient
            : 'linear-gradient(to right, #432681, #13101F)', // Different gradient for non-response
        backgroundSize: '100% 100%',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        height: '100%',
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
        border: '5px solid #12ffff', // Add a border
        borderRadius: '15px', // Add rounded corners
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Add a shadow for depth
      }}
    >
      <div
        style={{
          color: 'white',
          fontSize: 60,
          fontStyle: 'normal',
          letterSpacing: '-0.025em',
          lineHeight: 1.4,
          marginTop: 30,
          padding: '0 120px',
          whiteSpace: 'pre-wrap',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Add text shadow for better readability
        }}
      >
          {status === 'response'
            ? `Nice choice.${fruit ? ` ${fruit.toUpperCase()}!!` : ''}`
            : 'Learn how to deploy  Smart Contract  on Conflux Network!'}

        </div>
      </div>
    ),
    intents: [
     
      <Button.Link href="https://youtu.be/OG4zy8ryTVM?si=zxgcmUoOh0hN4NCd">Watch Tutorial</Button.Link>,
      <Button.Link href="https://omega1.hashnode.dev/how-to-deploy-smart-contract-on-conflux-network-using-hardhat">Read Article</Button.Link>,
      status === 'response' && <Button.Reset>Reset</Button.Reset>,
    ],
    
  })
})




// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
