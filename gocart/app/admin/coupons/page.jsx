'use client'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { DeleteIcon } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"

export default function AdminCoupons() {

    const { getToken } = useAuth();

    const [coupons, setCoupons] = useState([])

    const [newCoupon, setNewCoupon] = useState({
        code: '',
        description: '',
        discount: '',
        forNewUser: false,
        forMember: false,
        isPublic: false,
        expiresAt: new Date()
    })

    const fetchCoupons = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/admin/coupon', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setCoupons(data.coupons)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const handleAddCoupon = async (e) => {
        e.preventDefault()
        // Logic to add a coupon
        try {
            const token = await getToken();
            
            newCoupon.discount = Number(newCoupon.discount);
            newCoupon.expiresAt = new Date(newCoupon.expiresAt);

            const { data } = await axios.post('/api/admin/coupon', { coupon: newCoupon }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success(data.message)
            await fetchCoupons();
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }

    }

    const handleChange = (e) => {
        setNewCoupon({ ...newCoupon, [e.target.name]: e.target.value })
    }

    const deleteCoupon = async (code) => {
        // Logic to delete a coupon
        try {
            const confirm = window.confirm("Are you sure you want to delete this coupon?");
            if (!confirm) return;
            
            const token = await getToken();
            await axios.delete(`/api/admin/coupon?code=${code}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            await fetchCoupons();
            toast.success("Coupon deleted successfully")
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }

    }

    useEffect(() => {
        fetchCoupons();
    }, [])

    return (
        <div className="mb-40 text-slate-500">

            {/* Add Coupon */}
            <form onSubmit={(e) => toast.promise(handleAddCoupon(e), { loading: "Adding coupon..." })} className="max-w-sm text-sm">
                <h2 className="text-2xl">Add <span className="font-medium text-slate-800">Coupons</span></h2>
                <div className="flex gap-2 mt-2 max-sm:flex-col">
                    <input type="text" placeholder="Coupon Code" className="w-full p-2 mt-2 border rounded-md border-slate-200 outline-slate-400"
                        name="code" value={newCoupon.code} onChange={handleChange} required
                    />
                    <input type="number" placeholder="Coupon Discount (%)" min={1} max={100} className="w-full p-2 mt-2 border rounded-md border-slate-200 outline-slate-400"
                        name="discount" value={newCoupon.discount} onChange={handleChange} required
                    />
                </div>
                <input type="text" placeholder="Coupon Description" className="w-full p-2 mt-2 border rounded-md border-slate-200 outline-slate-400"
                    name="description" value={newCoupon.description} onChange={handleChange} required
                />

                <label>
                    <p className="mt-3">Coupon Expiry Date</p>
                    <input type="date" placeholder="Coupon Expires At" className="w-full p-2 mt-1 border rounded-md border-slate-200 outline-slate-400"
                        name="expiresAt" value={format(newCoupon.expiresAt, 'yyyy-MM-dd')} onChange={handleChange}
                    />
                </label>

                <div className="mt-5">
                    <div className="flex gap-2 mt-3">
                        <label className="relative inline-flex items-center gap-3 text-gray-900 cursor-pointer">
                            <input type="checkbox" className="sr-only peer"
                                name="forNewUser" checked={newCoupon.forNewUser}
                                onChange={(e) => setNewCoupon({ ...newCoupon, forNewUser: e.target.checked })}
                            />
                            <div className="h-6 transition-colors duration-200 rounded-full w-11 bg-slate-300 peer peer-checked:bg-green-600"></div>
                            <span className="absolute w-4 h-4 transition-transform duration-200 ease-in-out bg-white rounded-full dot left-1 top-1 peer-checked:translate-x-5"></span>
                        </label>
                        <p>For New User</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <label className="relative inline-flex items-center gap-3 text-gray-900 cursor-pointer">
                            <input type="checkbox" className="sr-only peer"
                                name="forMember" checked={newCoupon.forMember}
                                onChange={(e) => setNewCoupon({ ...newCoupon, forMember: e.target.checked })}
                            />
                            <div className="h-6 transition-colors duration-200 rounded-full w-11 bg-slate-300 peer peer-checked:bg-green-600"></div>
                            <span className="absolute w-4 h-4 transition-transform duration-200 ease-in-out bg-white rounded-full dot left-1 top-1 peer-checked:translate-x-5"></span>
                        </label>
                        <p>For Member</p>
                    </div>
                </div>
                <button className="p-2 px-10 mt-4 text-white transition rounded bg-slate-700 active:scale-95">Add Coupon</button>
            </form>

            {/* List Coupons */}
            <div className="mt-14">
                <h2 className="text-2xl">List <span className="font-medium text-slate-800">Coupons</span></h2>
                <div className="max-w-4xl mt-4 overflow-x-auto border rounded-lg border-slate-200">
                    <table className="min-w-full text-sm bg-white">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-left text-slate-600">Code</th>
                                <th className="px-4 py-3 font-semibold text-left text-slate-600">Description</th>
                                <th className="px-4 py-3 font-semibold text-left text-slate-600">Discount</th>
                                <th className="px-4 py-3 font-semibold text-left text-slate-600">Expires At</th>
                                <th className="px-4 py-3 font-semibold text-left text-slate-600">New User</th>
                                <th className="px-4 py-3 font-semibold text-left text-slate-600">For Member</th>
                                <th className="px-4 py-3 font-semibold text-left text-slate-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {coupons.map((coupon) => (
                                <tr key={coupon.code} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-800">{coupon.code}</td>
                                    <td className="px-4 py-3 text-slate-800">{coupon.description}</td>
                                    <td className="px-4 py-3 text-slate-800">{coupon.discount}%</td>
                                    <td className="px-4 py-3 text-slate-800">{format(coupon.expiresAt, 'yyyy-MM-dd')}</td>
                                    <td className="px-4 py-3 text-slate-800">{coupon.forNewUser ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-3 text-slate-800">{coupon.forMember ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-3 text-slate-800">
                                        <DeleteIcon onClick={() => toast.promise(deleteCoupon(coupon.code), { loading: "Deleting coupon..." })} className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-800" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}