import connectDB from "@/Config/database";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {

    try {

        const { userId } = getAuth(request);

        await connectDB();

        const addresses = await Address.find({ userId });

        return NextResponse.json({
            success: true,
            message: "Addresses retrieved successfully",
            addresses
        }, {
            status: 200
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to retrieve addresses",
            error: error.message
        }, {
            status: 500
        });
    }
};