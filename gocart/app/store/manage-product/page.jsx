'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import { useAuth, useUser } from "@clerk/nextjs"
import axios from "axios"

export default function StoreManageProducts() {

    const { getToken } = useAuth();
    const { user } = useUser();

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])

    const fetchProducts = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/store/product', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setProducts(data.products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            setLoading(false);
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false);
    }

    const toggleStock = async (productId) => {
        // Logic to toggle the stock of a product
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/store/stock-toggle', { productId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts((prevProducts) => prevProducts.map((product) => product.id === productId ? { ...product, inStock: !product.inStock } : product));
            toast.success(data.message);
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message);
        }
    }

    useEffect(() => {
        if (user) {
            fetchProducts()
        }
    }, [user])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="mb-5 text-2xl text-slate-500">Manage <span className="font-medium text-slate-800">Products</span></h1>
            <table className="w-full max-w-4xl overflow-hidden text-sm text-left rounded ring ring-slate-200">
                <thead className="tracking-wider text-gray-700 uppercase bg-slate-50">
                    <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="hidden px-4 py-3 md:table-cell">Description</th>
                        <th className="hidden px-4 py-3 md:table-cell">MRP</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-slate-700">
                    {products.map((product) => (
                        <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <Image width={40} height={40} className='p-1 rounded shadow cursor-pointer' src={product.images[0]} alt="" />
                                    {product.name}
                                </div>
                            </td>
                            <td className="hidden max-w-md px-4 py-3 truncate text-slate-600 md:table-cell">{product.description}</td>
                            <td className="hidden px-4 py-3 md:table-cell">{currency} {product.mrp.toLocaleString('en-US')}</td>
                            <td className="px-4 py-3">{currency} {product.price.toLocaleString('en-US')}</td>
                            <td className="px-4 py-3 text-center">
                                <label className="relative inline-flex items-center gap-3 text-gray-900 cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" onChange={() => toast.promise(toggleStock(product.id), { loading: "Updating data..." })} checked={product.inStock} />
                                    <div className="h-5 transition-colors duration-200 rounded-full w-9 bg-slate-300 peer peer-checked:bg-green-600"></div>
                                    <span className="absolute w-3 h-3 transition-transform duration-200 ease-in-out bg-white rounded-full dot left-1 top-1 peer-checked:translate-x-4"></span>
                                </label>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}