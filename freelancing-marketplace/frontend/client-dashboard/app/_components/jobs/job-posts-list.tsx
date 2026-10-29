'use client';
import { useAuth } from '@clerk/nextjs';
import { Icon } from '@iconify/react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import React from 'react'

type JobPost = {
    id: string;
    title: string;
    description: string;
    expertise_level: string;
    expected_duration: string;
    skills: string[];
    total_budget: string;
    status: string;
    created_At: string | null;
}

const JobPostsList = () => {

    const { getToken } = useAuth();

    const { data: jobs = [], isLoading, error } = useQuery({
        queryKey: ['client-jobs-posts'],
        queryFn: async () => {
            const token = await getToken();
            if (!token) {
                throw new Error('Your session has expired. Please log in again.');
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/jobs?role=client`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Job posts could not be loaded');
            }

            return result.data as JobPost[];
        }
    });

    if (isLoading) return <JobPostSkeleton />;
    if (error) return <Message text={error.message} />
    if (!jobs.length) return <Message text="You have not posted any jobs yet." />

    return (
        <div className="mt-8 grid gap-4">
            {jobs.map((job) => {
                const open = job.status === "PUBLISHED";
                const locked = job.status === "HIRED";

                return (
                    <article
                        key={job.id}
                        className="rounded-2xl border border-black/8 bg-white p-5 sm:p-6"
                    >
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${open
                                            ? "bg-[#e7f2e4] text-[#4d784a]"
                                            : "bg-[#f1f0e7] text-[#766f47]"
                                            }`}
                                    >
                                        {open ? "Open" : job.status === "DRAFT" ? "Draft" : "Closed"}
                                    </span>
                                    <span className="text-[10px] text-[#8a8f87]">
                                        {job.created_At ? `${formatDistanceToNow(new Date(job.created_At))} ago` : "Recently created"}
                                    </span>
                                </div>
                                <h2 className="mt-3 text-lg font-semibold">{job.title}</h2>
                                <p className="mt-2 text-xs text-[#757b73]">
                                    Fixed price · ${Number(job.total_budget).toLocaleString()} · {job.expertise_level} ·{" "}
                                    {job.expected_duration}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-start justify-end gap-2">
                                {locked ? (
                                    <span
                                        title="A job post cannot be edited after a hire is made."
                                        className="inline-flex h-10 cursor-not-allowed items-center gap-1.5 rounded-xl border border-black/8 bg-[#f1f2ef] px-4 text-xs font-semibold text-[#9a9e97]"
                                    >
                                        <Icon icon="solar:lock-keyhole-linear" width="15" />
                                        Editing locked
                                    </span>
                                ) : (
                                    <Link
                                        href={`/jobs/${job.id}/edit`}
                                        className="h-10 rounded-xl border border-black/10 px-4 py-3 text-xs font-semibold"
                                    >
                                        Edit
                                    </Link>
                                )}
                                {open && (
                                    <Link
                                        href={`/proposals?job=${job.id}`}
                                        className="h-10 rounded-xl bg-[#252724] px-4 py-3 text-xs font-semibold text-white"
                                    >
                                        Review proposals
                                    </Link>
                                )}
                            </div>
                        </div>
                        <p className="truncate max-w-4xl text-sm mt-5 leading-6 text-[#6f756d]">
                            {job.description}
                        </p>
                        <div className='mt-5 flex flex-wrap gap-2'>
                            {job?.skills?.map((skill) => {
                                return (
                                    <span key={skill} className='rounded-lg bg-[#f0f3ee] px-2.5 py-1.5 text-[10px] text-[#657062]'>
                                        {skill}
                                    </span>
                                )
                            })}
                        </div>
                        <div className='mt-5 grid grid-cols-3 gap-3 border-t border-black/7 pt-4 sm:max-w-md'>
                            {['Proposals', 'Shortlisted', 'Hires'].map((label) => {
                                return (
                                    <JobStat key={label} label={label} />
                                )
                            })}
                        </div>
                    </article>
                )
            })}
        </div>
    );
};

export default JobPostsList;

function JobStat({ label }: { label: string }) {
    return (
        <div>
            <p className="text-base font-semibold">0</p>
            <p className="mt-1 text-[10px] text-[#8a8f87]">{label}</p>
        </div>
    );
};

function Message({ text }: { text: string }) {
    return (
        <div className='mt-8 rounded-2xl border border-black/8 bg-white p-8 text-center text-sm text-[#737970]'>
            {text}
        </div>
    )
};

function JobPostSkeleton() {
    return (
        <div className='mt-8 grid-4'>
            {[1, 2].map((item) => {
                return (
                    <div key={item} className='h-64 animate-pulse rounded-2xl border border-black/6 bg-white' />
                )
            })}
        </div>
    )
};