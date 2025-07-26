import connectDB from "@/Config/database";
import authSeller from "@/lib/authSeller";
import Address from "@/models/Address";
import Order from "@/models/order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {

    try {

        const { userId } = getAuth(request);

        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse
            .json({
                success: false,
                message: "User not authenticated as seller",
            }, {
                status: 401
            })
        }

        await connectDB();

        Address.length

        const orders = await Order.find({}).populate("address items.product");

        return NextResponse.json({
            success: true,
            message: "Orders fetched successfully",
            orders
        }, {
            status: 200
        });
        
    } catch (error) {
        return NextResponse
        .json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message
        }, {
            status: 500
        });
    }
};