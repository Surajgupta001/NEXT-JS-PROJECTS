import connectDB from "@/Config/database";
import Address from "@/models/Address";
import Order from "@/models/order";
import Product from "@/models/product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {

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

        await connectDB();

        // Find orders for the user
        const orders = await Order.find({ userId });

        // Populate the orders with product and address details
        const populatedOrders = await Promise.all(
            orders.map(async (order) => {
                // Populate product details for each item
                const populatedItems = await Promise.all(
                    order.items.map(async (item) => {
                        const product = await Product.findById(item.product);
                        return {
                            ...item.toObject(),
                            product: product
                        };
                    })
                );

                // Populate address details
                const address = await Address.findById(order.address);

                return {
                    ...order.toObject(),
                    items: populatedItems,
                    address: address
                };
            })
        );

        return NextResponse.json({
            success: true,
            message: "Orders fetched successfully",
            orders: populatedOrders
        }, {
            status: 200
        })

    } catch (error) {
        console.error("Fetch orders error:", error);
        return NextResponse.json({
            success: false,
            message: "Error fetching orders",
            error: error.message
        }, {
            status: 500
        })
    }
};