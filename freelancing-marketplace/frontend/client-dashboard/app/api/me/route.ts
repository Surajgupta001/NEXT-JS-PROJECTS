import { auth } from "@clerk/nextjs/server";

interface BackendAuthStatusResponse {
    success: boolean;
    message: string;
    data?: {
        role: 'client' | 'freelancer';
        accountExists: boolean;
        isOnboarded: boolean;
    },
};

export async function GET() {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Authentication required'
        }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    try {
        const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/auth/status?role=client`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!backendResponse.ok) {
            console.error(`Backend authentication status request failed with status: ${backendResponse.status}`);
            return new Response(JSON.stringify({
                success: false,
                message: 'Failed to retrieve authentication status from backend'
            }), {
                status: backendResponse.status,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const authStatus = (await backendResponse.json()) as BackendAuthStatusResponse;

        if (!authStatus.data) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Authentication status data is missing'
            }), {
                status: 502,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Authentication status retrieved successfully',
            data: authStatus.data
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Backend authentication status request failed:', error);
        
        return new Response(JSON.stringify({
            success: false,
            message: 'An error occurred while retrieving authentication status'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}