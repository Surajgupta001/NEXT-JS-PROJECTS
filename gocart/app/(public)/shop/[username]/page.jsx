'use client'
import ProductCard from "@/components/ProductCard"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MailIcon, MapPinIcon } from "lucide-react"
import Loading from "@/components/Loading"
import Image from "next/image"
import axios from "axios"
import toast from "react-hot-toast"

export default function StoreShop() {

    const { username } = useParams()
    const [products, setProducts] = useState([])
    const [storeInfo, setStoreInfo] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchStoreData = async () => {
        try {
            const { data } = await axios.get(`/api/store/data/?username=${username}`)
            setStoreInfo(data.store)
            setProducts(data.store.Product)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchStoreData()
    }, [])

    return !loading ? (
        <div className="min-h-[70vh] mx-6">

            {/* Store Info Banner */}
            {storeInfo && (
                <div className="flex flex-col items-center gap-6 p-6 mx-auto mt-6 shadow-xs max-w-7xl bg-slate-50 rounded-xl md:p-10 md:flex-row">
                    <Image
                        src={storeInfo.logo}
                        alt={storeInfo.name}
                        className="object-cover border-2 rounded-md size-32 sm:size-38 border-slate-100"
                        width={200}
                        height={200}
                    />
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-semibold text-slate-800">{storeInfo.name}</h1>
                        <p className="max-w-lg mt-2 text-sm text-slate-600">{storeInfo.description}</p>
                        <div className="mt-4 space-y-1 text-xs text-slate-500"></div>
                        <div className="space-y-2 text-sm text-slate-500">
                            <div className="flex items-center">
                                <MapPinIcon className="w-4 h-4 mr-2 text-gray-500" />
                                <span>{storeInfo.address}</span>
                            </div>
                            <div className="flex items-center">
                                <MailIcon className="w-4 h-4 mr-2 text-gray-500" />
                                <span>{storeInfo.email}</span>
                            </div>
                           
                        </div>
                    </div>
                </div>
            )}

            {/* Products */}
            <div className="mx-auto mb-40 max-w-7xl">
                <h1 className="mt-12 text-2xl">Shop <span className="font-medium text-slate-800">Products</span></h1>
                <div className="grid flex-wrap grid-cols-2 gap-6 mx-auto mt-5 sm:flex xl:gap-12">
                    {products.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
            </div>
        </div>
    ) : <Loading />
}