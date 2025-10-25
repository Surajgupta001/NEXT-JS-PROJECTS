import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get Store info & store products
export async function GET(request) {
    try {
        // Get store username from query params
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username').toLowerCase();

        if (!username) {
            return NextResponse.json({
                success: false,
                error: 'missing details: username'
            }, {
                status: 400
            })
        }

        // Get store info and instock products with ratings
        const store = await prisma.store.findUnique({
            where: { username , isActive: true },
            include: { Product: { include: { ratings: true } } }
        })

        if (!store) {
            return NextResponse.json({
                success: false,
                error: 'store not found'
            }, {
                status: 404
            })
        }

        return NextResponse.json({
            success: true,
            message: 'store fetched successfully',
            store
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