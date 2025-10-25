import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Approve Seller
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json({
                error: 'Not Authorised'
            }, {
                status: 401
            })
        }

        const { storeId, status } = await request.json()

        if (status === 'approved') {
            await prisma.store.update({
                where: {id: storeId},
                data: {status: 'approved', isActive: true}
            })
        } else if (status === 'rejected') {
            await prisma.store.update({
                where: {id: storeId},
                data: {status: 'rejected'}
            })
        }

        const message = status === 'approved'
            ? 'Approved successfully'
            : 'Rejected successfully';

        return NextResponse.json({ message })

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: error.code || error.messages
        }, {
            status: 400
        })
    }
};

// Get all pending and rejected store
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json({
                error: 'Not Authorised'
            }, {
                status: 401
            })
        }

        // Return only pending applications so the Approve page lists items awaiting approval
        const stores = await prisma.store.findMany({
            where: { status: 'pending' },
            include: { user: true }
        })

        return NextResponse.json({
            stores
        })
        
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: error.code || error.messages
        }, {
            status: 400
        })
    }  
};