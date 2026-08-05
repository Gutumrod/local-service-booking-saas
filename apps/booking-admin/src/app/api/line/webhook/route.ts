import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-line-signature');

    if (!signature && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Missing LINE signature' }, { status: 401 });
    }

    const events = body.events || [];
    for (const event of events) {
      if (event.type === 'message') {
        console.log('[Admin LINE Webhook Event]:', event.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Admin LINE Webhook Processed' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'active', service: 'Store Admin LINE Webhook Endpoint' });
}
