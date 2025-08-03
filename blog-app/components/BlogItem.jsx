import { assets, blog_data } from '@/Assests/assets'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function BlogItem({ title, description, category, image, id }) {
    return (
        <div className='max-w-[330px] sm:max-w-[300px] bg-white border border-black hover:shadow-[-7px_7px_0px_#000000] transition-all duration-300 ease-in-out'>
            <Link href={`/blogs/${id}`}>
                <Image src={image} width={400} height={400} className='border-b border-black' alt={`${title} - ${category} blog post`} />
            </Link>
            <p className='ml-5 mt-5 px-1 inline-block bg-black text-white text-sm'>{category}</p>
            <div className="p-5">
                <h5 className='mb-2 text-lg font-medium tracking-tight text-gray-900'>{title}</h5>
                <p className='text-sm text-gray-700 mb-3 tracking-tight'>{description}</p>
                <Link href={`/blogs/${id}`} className='inline-flex items-center py-2 font-semibold text-center'>
                    Read more <Image src={assets.arrow} width={12} className='ml-2' alt="Read more arrow icon" />
                </Link>
            </div>
        </div>
    )
}

export default BlogItem
