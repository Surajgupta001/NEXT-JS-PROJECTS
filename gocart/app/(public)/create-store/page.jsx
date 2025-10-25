'use client'
import { assets } from "@/assets/assets"
import { useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function CreateStore() {

    const { user } = useUser();
    const router = useRouter();
    const { getToken } = useAuth();
    
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")

    const [storeInfo, setStoreInfo] = useState({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        image: ""
    })

    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    const fetchSellerStatus = async () => {
        // Logic to check if the store is already submitted
        const token = await getToken();
        try {
            const { data } = await axios.get('/api/store/create', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (['approved', 'rejected', 'pending'].includes(data.status)){
                setStatus(data.status)
                setAlreadySubmitted(true)
                switch (data.status) {
                    case 'approved':
                        setMessage('You store has been approved, you can now add products to your store from dashboard')
                        setTimeout(() => router.push('/store'), 5000)
                        break;
                    case 'rejected':
                        setMessage('Your store has been rejected, please contact admin for more details')
                        break;
                    case 'pending':
                        setMessage('Your store request is pending, please wait for admin to approve your store')
                        break;
                    default:
                        break;
                }
            } else {
                setAlreadySubmitted(false)
            }
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message);
        }
        setLoading(false)
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        // Logic to submit the store details
        if (!user) {
            return toast('Please login to continue')
        }
        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append('name', storeInfo.name);
            formData.append('username', storeInfo.username);
            formData.append('description', storeInfo.description);
            formData.append('email', storeInfo.email);
            formData.append('contact', storeInfo.contact);
            formData.append('address', storeInfo.address);
            formData.append('image', storeInfo.image);

            const { data } = await axios.post('/api/store/create', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            toast.success(data.message || 'Store created successfully')
            await fetchSellerStatus();
            
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message);
        }
    }

    useEffect(() => {
        if (user) {
            fetchSellerStatus()
        }
    }, [user])

    if (!user) {
        return (
            <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                <h1 className="text-2xl font-semibold sm:text-4xl">Please <span className="text-slate-500">login</span> to create a store</h1>
            </div>
        )
    }

    return !loading ? (
        <>
            {!alreadySubmitted ? (
                <div className="mx-6 min-h-[70vh] my-16">
                    <form onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Submitting data..." })} className="flex flex-col items-start gap-3 mx-auto max-w-7xl text-slate-500">
                        {/* Title */}
                        <div>
                            <h1 className="text-3xl ">Add Your <span className="font-medium text-slate-800">Store</span></h1>
                            <p className="max-w-lg">To become a seller on GoCart, submit your store details for review. Your store will be activated after admin verification.</p>
                        </div>

                        <label className="mt-10 cursor-pointer">
                            Store Logo
                            <Image src={storeInfo.image ? URL.createObjectURL(storeInfo.image) : assets.upload_area} className="w-auto h-16 mt-2 rounded-lg" alt="" width={150} height={100} />
                            <input type="file" accept="image/*" onChange={(e) => setStoreInfo({ ...storeInfo, image: e.target.files[0] })} hidden />
                        </label>

                        <p>Username</p>
                        <input name="username" onChange={onChangeHandler} value={storeInfo.username} type="text" placeholder="Enter your store username" className="w-full max-w-lg p-2 border rounded border-slate-300 outline-slate-400" />

                        <p>Name</p>
                        <input name="name" onChange={onChangeHandler} value={storeInfo.name} type="text" placeholder="Enter your store name" className="w-full max-w-lg p-2 border rounded border-slate-300 outline-slate-400" />

                        <p>Description</p>
                        <textarea name="description" onChange={onChangeHandler} value={storeInfo.description} rows={5} placeholder="Enter your store description" className="w-full max-w-lg p-2 border rounded resize-none border-slate-300 outline-slate-400" />

                        <p>Email</p>
                        <input name="email" onChange={onChangeHandler} value={storeInfo.email} type="email" placeholder="Enter your store email" className="w-full max-w-lg p-2 border rounded border-slate-300 outline-slate-400" />

                        <p>Contact Number</p>
                        <input name="contact" onChange={onChangeHandler} value={storeInfo.contact} type="text" placeholder="Enter your store contact number" className="w-full max-w-lg p-2 border rounded border-slate-300 outline-slate-400" />

                        <p>Address</p>
                        <textarea name="address" onChange={onChangeHandler} value={storeInfo.address} rows={5} placeholder="Enter your store address" className="w-full max-w-lg p-2 border rounded resize-none border-slate-300 outline-slate-400" />

                        <button className="px-12 py-2 mt-10 mb-40 text-white transition rounded bg-slate-800 active:scale-95 hover:bg-slate-900 ">Submit</button>
                    </form>
                </div>
            ) : (
                <div className="min-h-[80vh] flex flex-col items-center justify-center">
                    <p className="max-w-2xl mx-5 font-semibold text-center sm:text-2xl lg:text-3xl text-slate-500">{message}</p>
                    {status === "approved" && <p className="mt-5 text-slate-400">redirecting to dashboard in <span className="font-semibold">5 seconds</span></p>}
                </div>
            )}
        </>
    ) : (<Loading />)
}