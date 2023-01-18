import { NextApiRequest, NextApiResponse } from 'next'
import CnftTools, { RankedPolicyAsset } from '../../../../utils/cnftTools'

export type PolicyRankedAssetsResponse = {
  count: number
  items: RankedPolicyAsset[]
}

const handler = async (req: NextApiRequest, res: NextApiResponse<PolicyRankedAssetsResponse>) => {
  const { method, query } = req

  const policyId = query.policy_id

  try {
    switch (method) {
      case 'GET': {
        if (!policyId || typeof policyId !== 'string') {
          return res.status(400).end('Bad Request')
        }

        console.log('Fetching ranked assets with policy ID:', policyId)

        const cnftTools = new CnftTools()
        const data = await cnftTools.getPolicyAssets(policyId)

        console.log('Fetched assets:', data)

        return res.status(200).json({
          count: data.length,
          items: data,
        })
      }

      default: {
        res.setHeader('Allow', 'GET')
        return res.status(405).end('Method Not Allowed')
      }
    }
  } catch (error) {
    console.error(error)

    // @ts-ignore
    if (error?.status_code === 400 || error?.message === 'Invalid or malformed policy format.') {
      return res.status(400).end('Invalid or malformed Policy ID')
    }

    return res.status(500).end('Internal Server Error')
  }
}

export default handler
