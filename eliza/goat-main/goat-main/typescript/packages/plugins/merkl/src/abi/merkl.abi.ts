export const MERKL_CAMPAIGN_ADDRESS = "0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae";

export const MERKL_CAMPAIGN_ABI = [
    {
        inputs: [
            { internalType: "address", name: "_logic", type: "address" },
            { internalType: "bytes", name: "_data", type: "bytes" },
        ],
        stateMutability: "payable",
        type: "constructor",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: "address", name: "previousAdmin", type: "address" },
            { indexed: false, internalType: "address", name: "newAdmin", type: "address" },
        ],
        name: "AdminChanged",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [{ indexed: true, internalType: "address", name: "beacon", type: "address" }],
        name: "BeaconUpgraded",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [{ indexed: true, internalType: "address", name: "implementation", type: "address" }],
        name: "Upgraded",
        type: "event",
    },
    { stateMutability: "payable", type: "fallback" },
    { stateMutability: "payable", type: "receive" },
] as const;
