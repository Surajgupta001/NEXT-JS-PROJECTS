import connectDB from "@/Config/database";
import Product from "@/models/product";
import { NextResponse } from "next/server";

export async function GET(request) {
    
    try {

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