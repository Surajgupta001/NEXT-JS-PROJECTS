import { inngest } from "@/Config/inngest";
import Product from "@/models/product";
import User from "@/models/user";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {

    try {

        const { userId } = getAuth(request);
        const { address, items } = await request.json();

        if (!address || items.length === 0) {
            return NextResponse
            .json({
                success: false,
                message: "Invalid request"
            }, {
                status: 400
            });
        }

        // Calculate amount using items
        const amount = await items.reduce(async(acc, item) => {
            const product = await Product.findById(item.product);
            return acc + (product.price * item.quantity);
        }, 0);

        await inngest.send({
            name: 'order/created',
            data: {
                userId,
                items,
                amount : amount + Math.floor(amount * 0.2), // Adding 20% tax
                date: Date.now()
            }
        })

        // Clear user cart
        const user = await User.findById(userId);
        user.cartItems = {};
        await user.save();

        return NextResponse
        .json({
            success: true,
            message: "Order placed successfully"
        }, {
            status: 201
        })

    } catch (error) {
        return NextResponse
        .json({
            success: false,
            message: "Internal server error",
            error: error.message
        }, {
            status: 500
        });
    }
};