import { Asset } from '@meshsdk/core'

export interface ConnectedBalanceItem extends Asset {
  name?: string
}

export type AmountType = 'Fixed' | 'Percent' | ''
export type SplitType = 'Custom' | 'Equal' | 'EqualPlusTraits' | 'EqualPlusRanks' | ''

export interface PolicySettings {
  policyId: string
  weight: number
}
export interface TraitSettings {
  category: string
  trait: string
  amount: number
}
export interface RankSettings {
  minRange: number
  maxRange: number
  amount: number
}
export interface TokenSettings {
  tokenId: string
  tokenName: string
  tokenBalance: number
}

export interface Settings extends TokenSettings {
  policyIds: PolicySettings[]

  amountType: AmountType
  fixedAmount: number
  percentAmount: number

  splitType: SplitType
  rewardingTraits: TraitSettings[]
  rewardingRanks: RankSettings[]
}

export interface SnapshotHolder {
  stakeKey: string
  addresses: string[]
  assets: {
    [policyId: string]: string[]
  }
}

export interface PayoutHolder {
  stakeKey: string
  address: string
  payout: number
  txHash?: string
}

export interface ListingCount {
  [policyId: string]: {
    listed: number
    unlisted: number
  }
}

export type Count = Record<string, number>

export interface SpreadsheetReceiptItem {
  value: string | number
  type?: StringConstructor | NumberConstructor
  fontWeight?: string
}
