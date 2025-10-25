import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Get Dashboard Data for admin (total orders, total stores, total products, total revenue)
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

        // Get total orders
        const orders = await prisma.order.count();

        // Get total stores on app
        const stores = await prisma.store.count();

        // Get all orders include only createdAt and total & calculate total revenue
        const allOrders = await prisma.order.findMany({
            select: {
                createdAt: true,
                total: true
            }
        })

        // Calculate total revenue
        let totalRevenue = 0;
        allOrders.forEach(order => {
            totalRevenue += order.total;
        })

        const revenue = totalRevenue.toFixed(2); // Format to 2 decimal places

        // Total Products on app
        const products = await prisma.product.count();
        
        // Prepare dashboard data
        const dashboardData = {
            orders,
            stores,
            products,
            revenue,
            allOrders
        }

        return NextResponse.json({
            dashboardData
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