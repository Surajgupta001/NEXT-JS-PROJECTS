import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Toggle Stock of a product
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json({
                success: false,
                error: 'missing details: productId'
            }, {
                status: 400
            })
        }

        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json({
                success: false,
                error: 'not authorized'
            }, {
                status: 401
            })
        }

        // check if product exists
        const product = await prisma.product.findFirst({
            where: { id: productId, storeId }
        });

        if (!product) {
            return NextResponse.json({
                success: false,
                error: 'product not found'
            }, {
                status: 401
            })
        }

        await prisma.product.update({
            where: { id: productId },
            data : { inStock: !product.inStock }
        })

        return NextResponse.json({
            success: true,
            message: 'product stock updated successfully'
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