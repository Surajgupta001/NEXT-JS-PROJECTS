import { buttonVariants } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function NotAdminPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-svh gap-6">
            <ShieldAlert className="h-16 w-16 text-destructive" />
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">
                    You do not have administrator privileges to access this page.
                </p>
            </div>
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
                Back to Home
            </Link>
        </div>
    );
}
