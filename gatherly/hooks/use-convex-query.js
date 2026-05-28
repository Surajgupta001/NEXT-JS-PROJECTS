import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useConvexQuery = (query, ...args) => {
    const result = useQuery(query, ...args);

    const [data, setData] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (result === undefined) {
            setLoading(true);
        } else {
            try {
                setData(result);
                setError(null);
            } catch (error) {
                setError(error);
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        }
    }, [result]);

    return {
        data,
        loading,
        error,
    }
};

export const useConvexMutation = (mutation) => {
    const mutationFn = useMutation(mutation);

    const [data, setData] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mutate = async (...args) => {
        setLoading(true);
        setError(null);

        try {
            const response = await mutationFn(...args);
            setData(response);
            return response;
        } catch (error) {
            setError(error);
            toast.error(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        mutate,
    };
};