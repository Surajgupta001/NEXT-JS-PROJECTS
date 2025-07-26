import connectDB from "@/Config/database";
import authSeller from "@/lib/authSeller";
import Product from "@/models/product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    
    try {

        const { userId } = getAuth(request);

        const isSeller = authSeller(userId);

        if (!isSeller) {
            return NextResponse
            .json({
                success: false,
                message: "You are not a seller"
            }, {
                status: 403
            })
        };

        await connectDB();

        const products = await Product.find({});

        return NextResponse
        .json({
            success: true,
            message: "Products fetched successfully",
            products
        }, {
            status: 200
        })

        
    } catch (error) {
        return NextResponse
        .json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        }, {
            status: 500
        })
    }
};