import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';

export const fetchUserRating = createAsyncThunk('rating/fetchUserRating',
    async ({ getToken }, thunkAPI) => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/rating', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return data ? data.ratings : [];
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

const ratingSlice = createSlice({
    name: 'rating',
    initialState: {
        ratings: [],
    },
    reducers: {
        addRating: (state, action) => {
            state.ratings.push(action.payload)
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUserRating.fulfilled, (state, action) => {
            state.ratings = action.payload;
        })
    }
})

export const { addRating } = ratingSlice.actions

export default ratingSlice.reducer