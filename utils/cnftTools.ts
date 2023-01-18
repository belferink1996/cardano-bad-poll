import axios from 'axios'

interface FetchedRankedPolicyAsset {
  onSale: boolean
  assetID: string // '1'
  assetName: string // 'on-chain name'
  name: string // 'display name'
  encodedName: string // 'hex'
  iconurl: string // 'ips:// --> only the reference, no prefix'
  rarityRank: string // '1'
  ownerStakeKey: string // 'stake1...'

  [lowercasedTraitCategory: string]: any // eyewear: '(U) 3D Glasses'
}

export interface RankedPolicyAsset {
  assetId: string
  rank: number
  attributes: {
    [key: string]: string
  }
}

class CnftTools {
  baseUrl: string

  constructor() {
    this.baseUrl = 'https://api.cnft.tools'
  }

  getPolicyAssets = (policyId: string): Promise<RankedPolicyAsset[]> => {
    const uri = `${this.baseUrl}/api/external/${policyId}`

    return new Promise(async (resolve, reject) => {
      console.log(`Fetching from cnft.tools for policy ID ${policyId}`)

      try {
        const { data } = await axios.get<FetchedRankedPolicyAsset[]>(uri, {
          headers: {
            'Accept-Encoding': 'application/json',
          },
        })

        const excludeKeysFromAttributes = [
          'onSale',
          'assetID',
          'assetName',
          'name',
          'encodedName',
          'iconurl',
          'rarityRank',
          'ownerStakeKey',
        ]

        const payload = data
          .map((item) => {
            const attributes: Record<string, string> = {}

            Object.entries(item).forEach(([key, val]) => {
              if (!excludeKeysFromAttributes.includes(key)) {
                attributes[key] = val
              }
            })

            return {
              assetId: `${policyId}${item.encodedName}`,
              rank: Number(item.rarityRank),
              attributes,
            }
          })
          .sort((a, b) => a.rank - b.rank)

        console.log(`Fetched ${payload.length} items from cnft.tools`)

        return resolve(payload)
      } catch (error: any) {
        if (error?.response?.data?.error === 'Policy ID not found') {
          return resolve([])
        }

        return reject(error)
      }
    })
  }
}

export default CnftTools
