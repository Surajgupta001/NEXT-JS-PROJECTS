'use client'
import React, { useEffect, useState } from 'react'
import { assets, blog_data } from '@/Assests/assets'
import Image from 'next/image';
import Footer from '@/components/Footer';
import Link from 'next/link';

function page({ params }) {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const unwrappedParams = React.use(params);

    const fetchBlogData = () => {
        console.log("Looking for blog with ID:", unwrappedParams.id);
        console.log("Available blog IDs:", blog_data.map(blog => blog.id));
        
        const foundBlog = blog_data.find(blog => blog.id === Number(unwrappedParams.id));
        
        if (foundBlog) {
            setData(foundBlog);
            console.log("Blog found:", foundBlog.title);
        } else {
            console.log("Blog not found for ID:", unwrappedParams.id);
        }
        setLoading(false);
    }

    useEffect(() => {
        if (unwrappedParams?.id) {
            fetchBlogData();
        }
    }, [unwrappedParams?.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="mb-4 text-2xl font-bold">Blog Not Found</h1>
                    <p className="mb-4">The blog post with ID {unwrappedParams.id} could not be found.</p>
                    <Link href="/" className="text-blue-500 hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (data ? <>
        <div className='px-5 py-5 bg-gray-200 md:px-12 lg:px-28'>
            <div className='flex items-center justify-between'>
                <Link href='/'>
                    <Image src={assets.logo} alt="Logo" width={180} className='w-[130px] sm:w-auto' />
                </Link>
                <button className='flex items-center gap-2 font-medium py-1 px-3 sm:py-3 sm:px-6 border border-black shadow-[-7px_7px_0px_#000000] transition-all duration-30'>
                    Get Started
                    <Image src={assets.arrow} alt="Arrow" />
                </button>
            </div>
            <div className='my-24 text-center'>
                <h1 className='text-2xl sm:text-5xl font-medium max-w-[700px] mx-auto'>{data?.title}</h1>
                <Image src={data?.author_img} alt="Author" height={60} className='mx-auto mt-6 border border-white rounded-full' />
                <p className='mt-1 pb-2 text-lg max-w-[740px] mx-auto'>{data?.author}</p>
            </div>
        </div>
        <div className='mx-5 max-w-[800px] md:mx-auto mt-[-100px] mb-10'>
            <Image src={data?.image} width={1280} height={720} alt="Blog Image" className='border-4 border-white ' />
            <h1 className='my-8 text-[26px] font-semibold'>Introduction:</h1>
            <p>{data?.description}</p>
            <h3 className='my-5 text-[18px] font-semibold'>Step 1: Self-Reflection and Goal</h3>
            <p className='my-3'>
                Before you start your journey, take some time to reflect on your motivations and set clear goals.
                Understanding your purpose will help you stay focused and motivated throughout the process.
            </p>
            <h3 className='my-5 text-[18px] font-semibold'>Step 2: Research and Planning</h3>
            <p className='my-3'>
                Gather information and resources relevant to your topic. Create a plan or outline to organize your thoughts and actions.
            </p>
            <h3 className='my-5 text-[18px] font-semibold'>Step 3: Take Action</h3>
            <p className='my-3'>
                Start implementing your plan step by step. Don’t be afraid to make mistakes—learning is part of the process.
            </p>
            <h3 className='my-5 text-[18px] font-semibold'>Conclusion</h3>
            <p className='my-3'>
                Remember, consistency and perseverance are key. Celebrate your progress and keep moving forward!
            </p>
            <div className='my-24'>
                <p className='my-4 font-semibold text-black'>Share this article on social media:</p>
                <div className='flex'>
                    <Image src={assets.facebook_icon} width={50} alt='' />
                    <Image src={assets.twitter_icon} width={50} alt='' />
                    <Image src={assets.googleplus_icon} width={50} alt='' />
                </div>
            </div>
        </div>
        <Footer />
    </> : <></>
    )
}

export default page
