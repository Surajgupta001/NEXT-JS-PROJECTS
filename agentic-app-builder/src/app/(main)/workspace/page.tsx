import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import WorkspaceClient from '@/components/WorkspaceClient';

interface WorkspacePageProps {
    searchParams: Promise<{ prompt?: string; id?: string; }>;
};

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {

    const { userId } = await auth();
    if (!userId) redirect("/");

    const { prompt, id } = await searchParams;

    return (
        <WorkspaceClient />
    )
}
