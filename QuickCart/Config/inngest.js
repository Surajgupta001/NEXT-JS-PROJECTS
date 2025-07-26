import { Inngest } from "inngest";
import connectDB from "./database";
import User from "@/models/user";
import Order from "@/models/order";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

// Inngest Function to save user data to a database
export const syncUserCreation = inngest.createFunction(
    {
        id: 'sync-user-from-clerk',
    },
    {
        event: 'clerk/user.created',
    },
    async ({event}) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        const userdata = {
            _id: id,
            name: `${first_name} ${last_name}`,
            email: email_addresses[0].email_address,
            imageUrl: image_url,
        }

        await connectDB();
        await User.create(userdata);

    }
);

// Inngest Function to update user data in the database
export const syncUserUpdation = inngest.createFunction(
    {
        id: 'update-user-from-clerk',
    },
    {
        event: 'clerk/user.updated',
    },
    async ({event}) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        const userdata = {
            name: `${first_name} ${last_name}`,
            email: email_addresses[0].email_address,
            imageUrl: image_url,
        }

        await connectDB();
        await User.findByIdAndUpdate(id, userdata);
    }
);

// Inngest Function to delete user data from the database
export const syncUserDeletion = inngest.createFunction(
    {
        id: 'delete-user-from-clerk',
    },
    {
        event: 'clerk/user.deleted',
    },
    async ({event}) => {
        const { id } = event.data;

        await connectDB();
        await User.findByIdAndDelete(id);
    }
);

// Inngest Function to create user's order in database
export const createUserOrder = inngest.createFunction(
    {
        id: 'create-user-order',
        batchEvents: {
            maxSize: 25,
            timeout: '5s',
        }
    },
    {
        event: 'order/created',
    },
    async ({event}) => {
        const orders = event.map((event) => {
            return {
                userId: event.data.userId,
                items: event.data.items,
                amount: event.data.amount,
                address: event.data.address,
                date: event.data.date
            }
        })

        await connectDB();
        await Order.insertMany(orders);

        return {
            success: true,
            message: "Orders created successfully",
            processed: orders.length
        }
    }
);