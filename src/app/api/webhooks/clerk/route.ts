import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@db/prisma'
import { headers } from 'next/headers'

import { NextResponse } from 'next/server'
import { Webhook } from 'svix'

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error(
      'Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local',
    )
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const bodyPayload = await req.json()
  const body = JSON.stringify(bodyPayload)

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  if (evt.type === 'user.created') {
    const { first_name, last_name, image_url, id } = evt.data
    try {
      await prisma.user.create({
        data: {
          id: id,
          name: `${first_name} ${last_name}`,
          image: image_url,
        },
      })
      return NextResponse.json({ status: 'success' })
    } catch (error) {
      console.error('Error: Could not create user:', error)
      return NextResponse.json(
        { status: 'error', message: 'Could not create user' },
        { status: 500 },
      )
    }
  } else {
    return NextResponse.json({ status: 'unsupported' }, { status: 400 })
  }
}
