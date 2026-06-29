import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

// POST /api/webhooks/clerk — Handle Clerk webhooks
// This route must receive the raw body for svix verification
export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add CLERK_WEBHOOK_SECRET to .env');
  }

  const wh = new Webhook(SIGNING_SECRET);

  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { success: false, message: 'Error: Missing svix headers' },
      { status: 400 }
    );
  }

  const body = await req.text();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let evt: any;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification failed';
    console.error('Error: Could not verify webhook:', message);
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }

  await connectDB();

  const { id } = evt.data;
  const eventType = evt.type;
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { email_addresses, phone_numbers } = evt.data;

    const primaryEmail = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : null;
    const primaryPhone = phone_numbers && phone_numbers.length > 0 ? phone_numbers[0].phone_number : null;

    try {
      let user = await User.findOne({ clerkId: id });

      if (!user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const searchCriteria: any[] = [];
        if (primaryEmail) searchCriteria.push({ email: primaryEmail });
        if (primaryPhone) searchCriteria.push({ phone: primaryPhone });

        if (searchCriteria.length > 0) {
          user = await User.findOne({ $or: searchCriteria });
        }
      }

      if (user) {
        user.clerkId = id;
        if (primaryEmail) user.email = primaryEmail;
        if (primaryPhone) user.phone = primaryPhone;
        await user.save();
      } else {
        await User.create({
          clerkId: id,
          email: primaryEmail,
          phone: primaryPhone,
        });
      }
      console.log(`Successfully synced user ${id}`);
    } catch (error) {
      console.error('Error syncing user:', error);
      return NextResponse.json({ success: false, message: 'Database error syncing user' }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, message: 'Webhook received' }, { status: 200 });
}
