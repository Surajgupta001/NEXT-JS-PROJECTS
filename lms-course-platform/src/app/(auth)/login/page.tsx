import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GitCompareArrowsIcon } from 'lucide-react'

export default function page() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className='text-xl'>Welcome Back!</CardTitle>
                <CardDescription>Login with your Github Account</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
                <Button className='w-full cursor-pointer' variant='outline'>
                    <GitCompareArrowsIcon className="size-4" />
                    Sign in with Github
                </Button>
                <div className='relative text-sm text-center after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
                    <span className='relative z-10 px-2 bg-card text-muted-foreground'>Or Continue with</span>
                </div>
                <div className='grid gap-3'>
                    <div className='grid gap-2'>
                        <Label htmlFor='email'>Email</Label>
                        <Input type='email' placeholder='your@gmail.com'/>
                    </div>
                    <Button className='cursor-pointer'>Continue with Email</Button>
                </div>
            </CardContent>
        </Card>
    );
};
