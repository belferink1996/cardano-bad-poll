import { NextApiRequest, NextApiResponse } from 'next'
import blockfrost from '../../../../utils/blockfrost'

export interface WalletAssetsResponse {
  stakeKey: string
  assets: { unit: string; quantity: string }[]
}

const handler = async (req: NextApiRequest, res: NextApiResponse<WalletAssetsResponse>) => {
  const { method, query } = req

  const walletIdentifier = query.wallet_identifier as string
  const stakeKey = walletIdentifier.indexOf('stake1') === 0 ? walletIdentifier : null

  if (!stakeKey) {
    return res.status(400).end('Please provide a valid wallet identifer: stake1...')
  }

  try {
    switch (method) {
      case 'GET': {
        const wallet = {
          stakeKey,
          assets: await blockfrost.accountsAddressesAssetsAll(stakeKey),
        }

        return res.status(200).json(wallet)
      }

      default: {
        res.setHeader('Allow', 'GET')
        return res.status(405).end()
      }
    }
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export default handler
