'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import toast from "react-hot-toast"

export default function StoreOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const { getToken } = useAuth();

    const fetchOrders = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/store/orders', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setOrders(data.orders)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId, status) => {
        // Logic to update the status of an order
        try {
            const token = await getToken();
            await axios.post('/api/store/orders', { orderId, status }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setOrders(prev =>
                prev.map(order => 
                    order.id === orderId ? { ...order, status } : order
                )
            )
            toast.success("Order status updated successfully")
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const openModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />
    
    return (
        <>
            <h1 className="mb-5 text-2xl text-slate-500">Store <span className="font-medium text-slate-800">Orders</span></h1>
            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <div className="max-w-4xl overflow-x-auto border border-gray-200 rounded-md shadow">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs tracking-wider text-gray-700 uppercase bg-gray-50">
                            <tr>
                                {["Sr. No.", "Customer", "Total", "Payment", "Coupon", "Status", "Date"].map((heading, i) => (
                                    <th key={i} className="px-4 py-3">{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order, index) => (
                                <tr
                                    key={order.id}
                                    className="transition-colors duration-150 cursor-pointer hover:bg-gray-50"
                                    onClick={() => openModal(order)}
                                >
                                    <td className="pl-6 text-green-600" >
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3">{order.user?.name}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">${order.total}</td>
                                    <td className="px-4 py-3">{order.paymentMethod}</td>
                                    <td className="px-4 py-3">
                                        {order.isCouponUsed ? (
                                            <span className="px-2 py-1 text-xs text-green-700 bg-green-100 rounded-full">
                                                {order.coupon?.code}
                                            </span>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td className="px-4 py-3" onClick={(e) => { e.stopPropagation() }}>
                                        <select
                                            value={order.status}
                                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                                            className="text-sm border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                                        >
                                            <option value="ORDER_PLACED">ORDER_PLACED</option>
                                            <option value="PROCESSING">PROCESSING</option>
                                            <option value="SHIPPED">SHIPPED</option>
                                            <option value="DELIVERED">DELIVERED</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {new Date(order.createdAt).toLocaleString('en-US', { timeZone: 'UTC' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && selectedOrder && (
                <div onClick={closeModal} className="fixed inset-0 z-50 flex items-center justify-center text-sm bg-black/50 text-slate-700 backdrop-blur-xs" >
                    <div onClick={e => e.stopPropagation()} className="relative w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
                        <h2 className="mb-4 text-xl font-semibold text-center text-slate-900">
                            Order Details
                        </h2>

                        {/* Customer Details */}
                        <div className="mb-4">
                            <h3 className="mb-2 font-semibold">Customer Details</h3>
                            <p><span className="text-green-700">Name:</span> {selectedOrder.user?.name}</p>
                            <p><span className="text-green-700">Email:</span> {selectedOrder.user?.email}</p>
                            <p><span className="text-green-700">Phone:</span> {selectedOrder.address?.phone}</p>
                            <p><span className="text-green-700">Address:</span> {`${selectedOrder.address?.street}, ${selectedOrder.address?.city}, ${selectedOrder.address?.state}, ${selectedOrder.address?.zip}, ${selectedOrder.address?.country}`}</p>
                        </div>

                        {/* Products */}
                        <div className="mb-4">
                            <h3 className="mb-2 font-semibold">Products</h3>
                            <div className="space-y-2">
                                {selectedOrder.orderItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-2 border rounded shadow border-slate-100">
                                        <img
                                            src={item.product.images?.[0].src || item.product.images?.[0]}
                                            alt={item.product?.name}
                                            className="object-cover w-16 h-16 rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="text-slate-800">{item.product?.name}</p>
                                            <p>Qty: {item.quantity}</p>
                                            <p>Price: ${item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment & Status */}
                        <div className="mb-4">
                            <p><span className="text-green-700">Payment Method:</span> {selectedOrder.paymentMethod}</p>
                            <p><span className="text-green-700">Paid:</span> {selectedOrder.isPaid ? "Yes" : "No"}</p>
                            {selectedOrder.isCouponUsed && (
                                <p><span className="text-green-700">Coupon:</span> {selectedOrder.coupon.code} ({selectedOrder.coupon.discount}% off)</p>
                            )}
                            <p><span className="text-green-700">Status:</span> {selectedOrder.status}</p>
                            <p><span className="text-green-700">Order Date:</span> {new Date(selectedOrder.createdAt).toLocaleString('en-US', { timeZone: 'UTC' })}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end">
                            <button onClick={closeModal} className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300" >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
