import { NextResponse } from 'next/server'
import { getServerRelayer } from '@/lib/relayer-server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, data, value } = body

    if (!to || !data) {
      return NextResponse.json({ error: 'Missing required fields: to, data' }, { status: 400 })
    }

    const relayer = await getServerRelayer()

  // Try common method names from relayer SDK
  // Use unknown here to avoid explicit `any` while keeping runtime flexibility
  let result: unknown
    if (typeof relayer.relayTransaction === 'function') {
      result = await relayer.relayTransaction({ to, data, value })
    } else if (typeof relayer.relay === 'function') {
      result = await relayer.relay({ to, data, value })
    } else if (typeof relayer.sendTransaction === 'function') {
      result = await relayer.sendTransaction({ to, data, value })
    } else {
      throw new Error('Relayer instance does not expose a known relay method')
    }

    return NextResponse.json({ success: true, result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
