'use client'
import StoreInfo from "@/components/admin/StoreInfo"
import Loading from "@/components/Loading"
import { useAuth, useUser } from "@clerk/nextjs"
import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminStores() {

    const { user } = useUser();
    const { getToken } = useAuth();

    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchStores = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/admin/stores', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setStores(data.stores)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    const toggleIsActive = async (storeId) => {
        // Logic to toggle the status of a store
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/admin/toggle-store', { storeId }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            await fetchStores()
            toast.success(data.message)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    useEffect(() => {
        if (user) {
            fetchStores()
        }
    }, [user])

    return !loading ? (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Live <span className="font-medium text-slate-800">Stores</span></h1>

            {stores.length ? (
                <div className="flex flex-col gap-4 mt-4">
                    {stores.map((store) => (
                        <div key={store.id} className="flex max-w-4xl gap-4 p-6 bg-white border rounded-lg shadow-sm border-slate-200 max-md:flex-col md:items-end" >
                            {/* Store Info */}
                            <StoreInfo store={store} />

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <p>Active</p>
                                <label className="relative inline-flex items-center text-gray-900 cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" onChange={() => toast.promise(toggleIsActive(store.id), { loading: "Updating data..." })} checked={store.isActive} />
                                    <div className="h-5 transition-colors duration-200 rounded-full w-9 bg-slate-300 peer peer-checked:bg-green-600"></div>
                                    <span className="absolute w-3 h-3 transition-transform duration-200 ease-in-out bg-white rounded-full dot left-1 top-1 peer-checked:translate-x-4"></span>
                                </label>
                            </div>
                        </div>
                    ))}

                </div>
            ) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-3xl font-medium text-slate-400">No stores Available</h1>
                </div>
            )
            }
        </div>
    ) : <Loading />
}