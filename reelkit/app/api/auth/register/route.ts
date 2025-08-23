import { connectToDatabase } from "@/lib/database";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
    try {

        const { email, password } = await request.json();

        if(!email || !password) {
            return NextResponse
            .json({
                success: false, 
                error: "Email and password are required" 
            }, { 
                status: 400 
            });
        }

        await connectToDatabase();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse
            .json({
                success: false,
                error: "User already exists"
            }, {
                status: 409
            });
        }

        await User.create({
            email,
            password
        });

        return NextResponse
        .json({
            success: true,
            message: "User registered successfully"
        }, {
            status: 201
        })

    } catch (error) {
        console.error("Error registering user:", error);
        return NextResponse
        .json({
            success: false,
            error: "Failed to register user"
        }, {
            status: 500
        });
    }
};