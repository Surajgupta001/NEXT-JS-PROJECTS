'use client'
import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"
import { useAuth, useUser } from "@clerk/nextjs"
import axios from "axios"

const AdminLayout = ({ children }) => {

    const { user } = useUser();
    const { getToken } = useAuth();

    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchIsAdmin = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/admin/is-admin', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setIsAdmin(data.isAdmin)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchIsAdmin()
        }
    }, [user])

    return loading ? (
        <Loading />
    ) : isAdmin ? (
        <div className="flex flex-col h-screen">
            <AdminNavbar />
            <div className="flex items-start flex-1 h-full overflow-y-scroll no-scrollbar">
                <AdminSidebar />
                <div className="flex-1 h-full p-5 overflow-y-scroll lg:pl-12 lg:pt-12">
                    {children}
                </div>
            </div>
        </div>
    ) : (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
            <h1 className="text-2xl font-semibold sm:text-4xl text-slate-400">You are not authorized to access this page</h1>
            <Link href="/" className="flex items-center gap-2 p-2 px-6 mt-8 text-white rounded-full bg-slate-700 max-sm:text-sm">
                Go to home <ArrowRightIcon size={18} />
            </Link>
        </div>
    )
}

export default AdminLayout