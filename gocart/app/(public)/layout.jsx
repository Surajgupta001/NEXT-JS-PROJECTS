'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProduct } from "@/lib/features/product/productSlice";
import { useAuth, useUser } from "@clerk/nextjs";
import { fetchCart, uploadCart } from "@/lib/features/cart/cartSlice";
import { fetchAddress } from "@/lib/features/address/addressSlice";
import { fetchUserRating } from "@/lib/features/rating/ratingSlice";

export default function PublicLayout({ children }) {

    const dispatch = useDispatch();
    const { user } = useUser();
    const { getToken } = useAuth();

    const { cartItems } = useSelector(state => state.cart);

    useEffect(() => {
        dispatch(fetchProduct({}));
    }, [])

    useEffect(() => {
        if (user) {
            dispatch(fetchCart({ getToken }));
            dispatch(fetchAddress({ getToken }));
            dispatch(fetchUserRating({ getToken }));
        }
    }, [user])

    useEffect(() => {
        if (user) {
            dispatch(uploadCart({ getToken }));
        }
    }, [cartItems])

    return (
        <>
            <Banner />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
