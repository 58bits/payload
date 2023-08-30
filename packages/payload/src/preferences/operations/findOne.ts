import type { Config as GeneratedTypes } from 'payload/generated-types'

import type { Where } from '../../types/index.js'
import type { PreferenceRequest } from '../types.js'

async function findOne(
  args: PreferenceRequest,
): Promise<GeneratedTypes['collections']['_preference']> {
  const {
    key,
    req: { payload },
    user,
  } = args

  const where: Where = {
    and: [
      { key: { equals: key } },
      { 'user.value': { equals: user.id } },
      { 'user.relationTo': { equals: user.collection } },
    ],
  }

  const { docs } = await payload.find({
    collection: 'payload-preferences',
    depth: 0,
    pagination: false,
    user,
    where,
  })

  if (docs.length === 0) return null

  return docs[0]
}

export default findOne