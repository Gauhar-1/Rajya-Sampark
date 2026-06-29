import { Webhook } from 'svix';
import User from '../models/User.js';

export const handleClerkWebhook = async (req, res) => {
    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!SIGNING_SECRET) {
        throw new Error('Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
    }

    // Create new Svix instance with secret
    const wh = new Webhook(SIGNING_SECRET);

    // Get headers and body
    const headers = req.headers;
    const payload = req.body;

    // Get Svix headers for verification
    const svix_id = headers['svix-id'];
    const svix_timestamp = headers['svix-timestamp'];
    const svix_signature = headers['svix-signature'];

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({
            success: false,
            message: 'Error: Missing svix headers',
        });
    }

    let evt;

    // Attempt to verify the incoming webhook
    // If successful, the payload will be available from 'evt'
    // If verification fails, error out and return error code
    try {
        evt = wh.verify(payload, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        });
    } catch (err) {
        console.error('Error: Could not verify webhook:', err.message);
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    const { id } = evt.data;
    const eventType = evt.type;
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`);

    if (eventType === 'user.created' || eventType === 'user.updated') {
        const { email_addresses, phone_numbers } = evt.data;
        
        let primaryEmail = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : null;
        let primaryPhone = phone_numbers && phone_numbers.length > 0 ? phone_numbers[0].phone_number : null;
        
        try {
            // Upsert user based on clerkId or fallback matching
            let user = await User.findOne({ clerkId: id });
            
            if (!user) {
                // Check if user exists by phone or email from legacy system
                const searchCriteria = [];
                if (primaryEmail) searchCriteria.push({ email: primaryEmail });
                if (primaryPhone) searchCriteria.push({ phone: primaryPhone });

                if (searchCriteria.length > 0) {
                    user = await User.findOne({ $or: searchCriteria });
                }
            }

            if (user) {
                // Update existing user with new Clerk data
                user.clerkId = id;
                if (primaryEmail) user.email = primaryEmail;
                if (primaryPhone) user.phone = primaryPhone;
                await user.save();
            } else {
                // Create new user
                await User.create({
                    clerkId: id,
                    email: primaryEmail,
                    phone: primaryPhone
                });
            }
            console.log(`Successfully synced user ${id}`);
        } catch (error) {
            console.error('Error syncing user:', error);
            return res.status(500).json({ success: false, message: 'Database error syncing user' });
        }
    }

    return res.status(200).json({
        success: true,
        message: 'Webhook received',
    });
};
