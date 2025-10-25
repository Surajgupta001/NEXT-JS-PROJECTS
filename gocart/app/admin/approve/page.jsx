'use client'
import StoreInfo from "@/components/admin/StoreInfo"
import Loading from "@/components/Loading"
import { useAuth, useUser } from "@clerk/nextjs"
import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminApprove() {

    const { user } = useUser();
    const { getToken } = useAuth();
    
    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)


    const fetchStores = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/admin/approve-store', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setStores(data.stores)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    const handleApprove = async ({ storeId, status }) => {
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/admin/approve-store', {
                storeId,
                status
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            toast.success(data.message)
            await fetchStores()
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
            <h1 className="text-2xl">Approve <span className="font-medium text-slate-800">Stores</span></h1>

            {stores.length ? (
                <div className="flex flex-col gap-4 mt-4">
                    {stores.map((store) => (
                        <div key={store.id} className="flex max-w-4xl gap-4 p-6 bg-white border rounded-lg shadow-sm max-md:flex-col md:items-end" >
                            {/* Store Info */}
                            <StoreInfo store={store} />

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 pt-2">
                                <button onClick={() => toast.promise(handleApprove({ storeId: store.id, status: 'approved' }), { loading: "approving" })} className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700" >
                                    Approve
                                </button>
                                <button onClick={() => toast.promise(handleApprove({ storeId: store.id, status: 'rejected' }), { loading: 'rejecting' })} className="px-4 py-2 text-sm text-white rounded bg-slate-500 hover:bg-slate-600" >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}

                </div>) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-3xl font-medium text-slate-400">No Application Pending</h1>
                </div>
            )}
        </div>
    ) : <Loading />
}