import { inngest } from "@/Config/inngest";
import connectDB from "@/Config/database";
import Product from "@/models/product";
import User from "@/models/user";
import Order from "@/models/order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {

    try {

        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "User not authenticated"
            }, {
                status: 401
            });
        }

        const { address, items } = await request.json();

        if (!address || !items || items.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Invalid request - address and items are required"
            }, {
                status: 400
            });
        }

        await connectDB();

        // Calculate amount using items - fix the async reduce
        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return NextResponse.json({
                    success: false,
                    message: `Product not found: ${item.product}`
                }, {
                    status: 404
                });
            }
            amount += (product.offerPrice || product.price) * item.quantity;
        }

        const totalAmount = amount + Math.floor(amount * 0.02); // Adding 2% tax

        // Create order in database
        const newOrder = await Order.create({
            userId,
            items,
            amount: totalAmount,
            address,
            date: Date.now()
        });

        // Send to Inngest
        await inngest.send({
            name: 'order/created',
            data: {
                userId,
                orderId: newOrder._id,
                items,
                amount: totalAmount,
                date: Date.now()
            }
        });

        // Clear user cart
        const user = await User.findById(userId);
        if (user) {
            user.cartItems = {};
            await user.save();
        }

        return NextResponse.json({
            success: true,
            message: "Order placed successfully",
            orderId: newOrder._id
        }, {
            status: 201
        })

    } catch (error) {
        console.error("Order creation error:", error);
        return NextResponse.json({
            success: false,
            message: "Internal server error",
            error: error.message
        }, {
            status: 500
        });
    }
};