import connectDB from "@/Config/database";
import User from "@/models/user";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {

    try {

        const { userId } = getAuth(request);
        await connectDB();
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse
            .json({
                success: false,
                message: "User not found"
            }, {
                status: 404
            })
        }

        return NextResponse
        .json({
            success: true,
            message: "User found",
            user
        }, {
            status: 200
        })

    } catch (error) {
        return NextResponse
        .json({
            success: false,
            message: "Internal server error"
        }, {
            status: 500
        })
    }
};