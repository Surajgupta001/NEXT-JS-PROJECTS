'use client'
import { PackageIcon, Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useUser, useClerk, UserButton, Protect } from "@clerk/nextjs";

const Navbar = () => {

    const { user } = useUser();
    const { openSignIn } = useClerk();
    const router = useRouter();

    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state.cart.total)

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between py-4 mx-auto transition-all max-w-7xl">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-green-600">go</span>cart<span className="text-5xl text-green-600 leading-0">.</span>
                        <Protect plan='plus'>
                            <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                                plus
                            </p>
                        </Protect>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="items-center hidden gap-4 sm:flex lg:gap-8 text-slate-600">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/">About</Link>
                        <Link href="/">Contact</Link>

                        <form onSubmit={handleSearch} className="items-center hidden gap-2 px-4 py-3 text-sm rounded-full xl:flex w-xs bg-slate-100">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>

                        {
                            !user ? (
                                <button onClick={openSignIn} className="px-8 py-2 text-white transition bg-indigo-500 rounded-full hover:bg-indigo-600">
                                    Login
                                </button>
                            ) : (
                                <UserButton>
                                    <UserButton.MenuItems>
                                        <UserButton.Action labelIcon={<PackageIcon size={16} />} label="My Orders" onClick={() => router.push('/orders')} />
                                    </UserButton.MenuItems>
                                </UserButton>
                            )
                        }



                    </div>

                    {/* Mobile User Button  */}
                    <div className="sm:hidden">
                        {
                            user ? (
                                <div>
                                    <UserButton>
                                        <UserButton.MenuItems>
                                            <UserButton.Action labelIcon={<ShoppingCart size={16} />} label="Carts" onClick={() => router.push('/cart')} />
                                        </UserButton.MenuItems>
                                    </UserButton>
                                    {/* <UserButton>
                                        <UserButton.MenuItems>
                                            <UserButton.Action labelIcon={<PackageIcon size={16} />} label="My Orders" onClick={() => router.push('/orders')} />
                                        </UserButton.MenuItems>
                                    </UserButton> */}
                                </div>
                            ) : (
                                <button onClick={openSignIn} className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full">
                                    Login
                                </button>
                            )
                        }

                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar