import { httpRouter } from "convex/server";
import { httpAction } from './_generated/server';
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
    path: '/clerk-webhook',
    method: 'POST',
    handler: httpAction(async (context, request) => {

        // Handling webhooks secret
        const webhookSecret = process.env.CLERK_SIGNING_SECRET_KEY;
        if (!webhookSecret) {
            throw new Error('CLERK_SIGNING_SECRET_KEY is not defined in environment variables');
        }

        // Extract Svix headers
        const svix_id = request.headers.get('svix-id');
        const svix_signature = request.headers.get('svix-signature');
        const svix_timestamp = request.headers.get('svix-timestamp');

        if (!svix_id || !svix_signature || !svix_timestamp) {
            return new Response('Missing Svix headers', { status: 400 });
        }

        // Read the raw request body as text
        const body = await request.text();

        // Initialize the Svix webhook verifier
        const wh = new Webhook(webhookSecret);
        let event : WebhookEvent;

        // Verify the webhook signature and parse the event
        try {
            event = wh.verify(body, {
                'svix-id': svix_id,
                'svix-signature': svix_signature,
                'svix-timestamp': svix_timestamp
            }) as WebhookEvent;
        } catch (error) {
            console.error('Webhook verification failed:', error);
            return new Response('Invalid signature', { status: 400 });
        }

        // Handle the event
        const eventType = event.type;
        if (eventType === 'user.created') {
            // Save the user data to your convex database
            const { id, email_addresses, first_name, last_name } = event.data;
            
            const email = email_addresses[0].email_address; // Assuming the first email is the primary one
            const name = `${first_name || ''} ${last_name || ''}`.trim();

            try {
                await context.runMutation(api.users.syncUser, {
                    userId: id,
                    email,
                    name,
                });
            } catch (error) {
                console.error('Failed to save user data to database:', error);
                return new Response('Failed to save user data to database: ' + error, { status: 500 });
            }
        }

        return new Response('Webhook received successfully', { status: 200 });
    })
});

export default http;