import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GitCompareArrowsIcon } from 'lucide-react'


export default function page() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className='text-xl'>Welcome Back!</CardTitle>
                <CardDescription>Login with your Github Account</CardDescription>
            </CardHeader>
            <CardContent>
                <Button>
                    <GitCompareArrowsIcon className="size-4" />
                    Sign in with Github
                </Button>
            </CardContent>
        </Card>
    );
};
