import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type VercelAnalyticsDrainEvent = {
  eventType?: string
  event_type?: string
  eventName?: string
  event_name?: string
  timestamp?: number | string
  projectId?: string
  project_id?: string
  ownerId?: string
  owner_id?: string
  sessionId?: string | number
  session_id?: string | number
  deviceId?: string | number
  device_id?: string | number
  origin?: string
  path?: string
  route?: string
  referrer?: string
  country?: string
  deviceType?: string
  device_type?: string
  osName?: string
  os_name?: string
  clientName?: string
  client_name?: string
  vercelEnvironment?: string
  vercel_environment?: string
  [key: string]: unknown
}

const normalizeEvents = (payload: unknown): VercelAnalyticsDrainEvent[] => {
  if (Array.isArray(payload)) return payload as VercelAnalyticsDrainEvent[]

  if (payload && typeof payload === 'object') {
    const maybePayload = payload as { events?: unknown }
    if (Array.isArray(maybePayload.events)) return maybePayload.events as VercelAnalyticsDrainEvent[]
    return [payload as VercelAnalyticsDrainEvent]
  }

  return []
}

const normalizeTimestamp = (timestamp: VercelAnalyticsDrainEvent['timestamp']) => {
  if (!timestamp) return new Date().toISOString()

  const value = typeof timestamp === 'number' ? timestamp : Number(timestamp)
  const date = Number.isFinite(value) ? new Date(value) : new Date(timestamp)

  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const drainSecret = process.env.VERCEL_ANALYTICS_DRAIN_SECRET

  if (!supabaseUrl || !serviceRoleKey || !drainSecret) {
    return NextResponse.json(
      { error: 'Supabase service role or Vercel Analytics drain secret is not configured.' },
      { status: 500 },
    )
  }

  const requestSecret = request.nextUrl.searchParams.get('secret') || request.headers.get('x-analytics-secret')
  if (requestSecret !== drainSecret) {
    return NextResponse.json({ error: 'Unauthorized analytics drain request.' }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const events = normalizeEvents(payload)
  if (events.length === 0) {
    return NextResponse.json({ inserted: 0 })
  }

  const rows = events.map((event) => ({
    event_type: event.eventType || event.event_type || 'pageview',
    event_name: event.eventName || event.event_name || null,
    timestamp: normalizeTimestamp(event.timestamp),
    project_id: event.projectId || event.project_id || null,
    owner_id: event.ownerId || event.owner_id || null,
    session_id: event.sessionId || event.session_id ? String(event.sessionId || event.session_id) : null,
    device_id: event.deviceId || event.device_id ? String(event.deviceId || event.device_id) : null,
    origin: event.origin || null,
    path: event.path || null,
    route: event.route || null,
    referrer: event.referrer || null,
    country: event.country || null,
    device_type: event.deviceType || event.device_type || null,
    os_name: event.osName || event.os_name || null,
    client_name: event.clientName || event.client_name || null,
    vercel_environment: event.vercelEnvironment || event.vercel_environment || null,
    raw_event: event,
  }))

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const { error } = await supabaseAdmin.from('web_analytics_events').insert(rows)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ inserted: rows.length })
}
