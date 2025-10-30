'use client'

import { Star } from 'lucide-react';
import React, { useState } from 'react'
import { XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/nextjs';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { addRating } from '@/lib/features/rating/ratingSlice';

const RatingModal = ({ ratingModal, setRatingModal }) => {

    const { getToken } = useAuth();
    const dispatch = useDispatch();
    
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    const handleSubmit = async () => {
        if (rating < 0 || rating > 5) {
            return toast('Please select a rating');
        }
        if (review.length < 5) {
            return toast('write a short review');
        }
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/rating', {
                productId: ratingModal.productId,
                orderId: ratingModal.orderId,
                rating,
                review
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            dispatch(addRating(data.rating));
            toast.success(data.message);
            setRatingModal(null);
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message);
        }
    }

    return (
        <div className='fixed inset-0 flex items-center justify-center z-120 bg-black/10'>
            <div className='relative p-8 bg-white rounded-lg shadow-lg w-96'>
                <button onClick={() => setRatingModal(null)} className='absolute text-gray-500 top-3 right-3 hover:text-gray-700'>
                    <XIcon size={20} />
                </button>
                <h2 className='mb-4 text-xl font-medium text-slate-600'>Rate Product</h2>
                <div className='flex items-center justify-center mb-4'>
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            className={`size-8 cursor-pointer ${rating > i ? "text-green-400 fill-current" : "text-gray-300"}`}
                            onClick={() => setRating(i + 1)}
                        />
                    ))}
                </div>
                <textarea
                    className='w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400'
                    placeholder='Write your review (optional)'
                    rows='4'
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                ></textarea>
                <button onClick={e => toast.promise(handleSubmit(), { loading: 'Submitting...' })} className='w-full py-2 text-white transition bg-green-500 rounded-md hover:bg-green-600'>
                    Submit Rating
                </button>
            </div>
        </div>
    )
}

export default RatingModal