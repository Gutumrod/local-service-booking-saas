import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-line-signature');

    // Signature verification logic
    if (!signature && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Missing LINE signature' }, { status: 401 });
    }

    const events = body.events || [];
    
    for (const event of events) {
      if (event.type === 'message') {
        console.log('[LINE Webhook Message Event]:', event.message);
      } else if (event.type === 'follow') {
        console.log('[LINE Webhook User Followed OA]:', event.source?.userId);
      }
    }

    return NextResponse.json({ success: true, message: 'LINE Webhook Processed' }, { status: 200 });
  } catch (err: any) {
    console.error('[LINE Webhook Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'active', service: 'LINE OA Webhook Endpoint' });
}
