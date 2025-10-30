import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Add new Address
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { address } = await request.json();

        address.userId = userId;

        const newAddress = await prisma.address.create({
            data: address
        })

        return NextResponse.json({
            success: true,
            message: 'Address added successfully',
            newAddress
        }, {
            status: 200
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: error.code || error.message
        }, {
            status: 400
        })  
    }
};

// Get all addresses for a user
export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        const addresses = await prisma.address.findMany({
            where: {
                userId
            }
        })

        return NextResponse.json({
            success: true,
            addresses
        }, {
            status: 200
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: error.code || error.message
        }, {
            status: 400
        })
    }
};