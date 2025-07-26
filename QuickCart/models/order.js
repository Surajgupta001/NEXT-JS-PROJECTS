import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    items: [{
        product: {
            type: String,
            required: true,
            ref: 'product',
        },
        quantity: {
            type: Number,
            required: true,
        }
    }],
    amount: {
        type: Number,
        required: true,
    },
    address: {
        type: String,
        required: true,
        default: 'Order Placed'
    },
    date: {
        type: Number,
        default: Date.now
    }
});

const Order = mongoose.models.Order || mongoose.model("Order", addressSchema);

export default Order;