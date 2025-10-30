'use client'
import { addAddress } from "@/lib/features/address/addressSlice"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import { add } from "date-fns/add"
import { XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useDispatch } from "react-redux"

const AddressModal = ({ setShowAddressModal }) => {

    const { getToken } = useAuth();
    const dispatch = useDispatch();

    const [address, setAddress] = useState({
        name: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: ''
    })

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/address', { address }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            dispatch(addAddress(data.newAddress));
            toast.success(data.message);
            setShowAddressModal(false);
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || error.message);
        }
    }

    return (
        <form onSubmit={e => toast.promise(handleSubmit(e), { loading: 'Adding Address...' })} className="fixed inset-0 z-50 flex items-center justify-center h-screen bg-white/60 backdrop-blur">
            <div className="flex flex-col w-full max-w-sm gap-5 mx-6 text-slate-700">
                <h2 className="text-3xl ">Add New <span className="font-semibold">Address</span></h2>
                <input name="name" onChange={handleAddressChange} value={address.name} className="w-full p-2 px-4 border rounded outline-none border-slate-200" type="text" placeholder="Enter your name" required />
                <input name="email" onChange={handleAddressChange} value={address.email} className="w-full p-2 px-4 border rounded outline-none border-slate-200" type="email" placeholder="Email address" required />
                <input name="street" onChange={handleAddressChange} value={address.street} className="w-full p-2 px-4 border rounded outline-none border-slate-200" type="text" placeholder="Street" required />
                <div className="flex gap-4">
                    <input name="city" onChange={handleAddressChange} value={address.city} className="w-full p-2 px-4 border rounded outline-none border-slate-200" type="text" placeholder="City" required />
                    <input name="state" onChange={handleAddressChange} value={address.state} className="w-full p-2 px-4 border rounded outline-none border-slate-200" type="text" placeholder="State" required />
                </div>
                <div className="flex gap-4">
                    <input name="zip" onChange={handleAddressChange} value={address.zip} className="w-full p-2 px-4 border rounded outline-none border-slate-200" type="number" placeholder="Zip code" required />
                    <input name="country" onChange={handleAddressChange} value={address.country} className="w-full p-2 px-4 border rounded outline-none border-slate-200" type="text" placeholder="Country" required />
                </div>
                <input name="phone" onChange={handleAddressChange} value={address.phone} className="w-full p-2 px-4 border rounded outline-none border-slate-200" type="text" placeholder="Phone" required />
                <button className="bg-slate-800 text-white text-sm font-medium py-2.5 rounded-md hover:bg-slate-900 active:scale-95 transition-all">SAVE ADDRESS</button>
            </div>
            <XIcon size={30} className="absolute cursor-pointer top-5 right-5 text-slate-500 hover:text-slate-700" onClick={() => setShowAddressModal(false)} />
        </form>
    )
}

export default AddressModal