import { metadata } from "@/app/layout";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request) {
    try {
        const { userId, has } = getAuth(request);
        if (!userId) {
            return NextResponse.json({
                error: 'Not Authorised'
            }, {
                status: 401
            })
        }

        const { addressId, items, couponCode, paymentMethod } = await request.json();

        // check if all required fields are present
        if (!addressId || !items || items.length === 0 || !paymentMethod || !Array.isArray(items)) {
            return NextResponse.json({
                error: 'Missing required fields'
            })
        }

        let coupon = null;

        if (couponCode) {
            coupon = await prisma.coupon.findUnique({
                where: {
                    code: couponCode,
                }
            })

            if (!coupon) {
                return NextResponse.json({
                    success: false,
                    error: 'coupon not found or expired'
                }, {
                    status: 400
                })
            }
        }

        // check if coupon is applicable for new users only
        if (couponCode && coupon.forNewUser) {
            const userOrders = await prisma.order.findMany({
                where: { userId }
            })

            if (userOrders.length > 0) {
                return NextResponse.json({
                    success: false,
                    error: 'coupon valid for new users only'
                }, {
                    status: 400
                })
            }
        }

        const isPlusMember = has({ plan: 'plus' });

        // check if coupon is applicable for plus members only
        if (couponCode && coupon.forMember) {
            if (!isPlusMember) {
                return NextResponse.json({
                    success: false,
                    error: 'coupon valid for plus members only'
                }, {
                    status: 400
                })
            }
        }

        // Group orders by storeId using map
        const ordersByStore = new Map();
        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.id }
            })
            const storeId = product.storeId;
            if (!ordersByStore.has(storeId)) {
                ordersByStore.set(storeId, []);
            }
            ordersByStore.get(storeId).push({
                ...item,
                price: product.price
            })
        }

        let orderIds = [];
        let fullAmount = 0;

        let isShippingFeeAdded = false;

        // Create order for each seller
        for (const [storeId, sellerItems] of ordersByStore.entries()) {
            let total = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            if (couponCode) {
                total -= (total * coupon.discount) / 100;
            }

            if (!isPlusMember && !isShippingFeeAdded) {
                total += 5; // flat shipping fee
                isShippingFeeAdded = true;
            }

            fullAmount += parseFloat(total.toFixed(2));

            const order = await prisma.order.create({
                data: {
                    userId,
                    storeId,
                    addressId,
                    total: parseFloat(total.toFixed(2)),
                    paymentMethod,
                    isCouponUsed: couponCode ? true : false,
                    coupon: coupon ? coupon : {},
                    orderItems: {
                        create: sellerItems.map(item => ({
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                }
            })
            orderIds.push(order.id);
        }

        // Handle payment method specific logic
        if (paymentMethod === 'STRIPE') {
            const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
            const origin = await request.headers.get('origin');

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Order',
                        },
                        unit_amount: Math.round(fullAmount * 100),
                    },
                    quantity: 1,
                }],
                expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes from now
                mode: 'payment',
                success_url: `${origin}/loading?nextUrl=orders`,
                cancel_url: `${origin}/cart`,
                metadata: {
                    orderIds: orderIds.join(','),
                    userId,
                    appId: 'gocart'
                }
            })
            return NextResponse.json({
                session
            })
        }

        // Clear the cart after placing order
        await prisma.user.update({
            where: { id: userId },
            data: { cart: {} }
        })

        return NextResponse.json({
            success: true,
            message: 'Order placed successfully',
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

// Get all orders for a user
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        const orders = await prisma.order.findMany({
            where: {
                userId,
                OR: [
                    { paymentMethod: PaymentMethod.COD },
                    { AND: [{ paymentMethod: PaymentMethod.STRIPE }, { isPaid: true }] }
                ]
            },
            include: {
                orderItems: { include: { product: true } },
                address: true,
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({
            success: true,
            message: 'Orders fetched successfully',
            orders
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