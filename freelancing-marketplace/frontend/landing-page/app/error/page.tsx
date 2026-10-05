import Link from "next/link";

const errorMessages: Record<string, string> = {
    missing_signup_details: 'Your signup link is incomplete. Please start the signup process again.',
    invalid_role: 'The role specified in the signup link is invalid. Please start the signup process again.',
    authentication_unavailable: 'Authentication service is currently unavailable. Please try again later.',
    role_mismatch: 'The role in the signup link does not match your account. Please start the signup process again.',
    invalid_or_expired_token: 'Your signup link is invalid or has expired. Please request a new signup link.',
    backend_signup_failed: 'There was an issue completing your signup. Please try again later.',
};

interface ErrorPageProps {
    searchParams: Promise<{ reason?: string }>;
}

const Page = async ({ searchParams }: ErrorPageProps) => {

    const { reason } = await searchParams;
    const message = errorMessages[reason ?? ''] ?? '';

    return (
        <main className="grid min-h-screen place-items-center bg-[#fbfcfa] px-6">
            <section className="w-full max-w-md p-8 text-center bg-white border border-black/31 shadow-[0_24px_70px_rgba(31, 38, 29, 0.08)] rounded-3xl">
                <span className="grid h-12 mx-auto place-items-center rounded-3xl bg-[#fff0ee] text-xl text-[#a04f47]">
                    !
                </span>
                <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#20231f]">
                    We couldn’t finish signup
                </h1>
                <p className="mt-3 leading-6 test-sm text-[#747970]">
                    {message}
                </p>
                <Link href="/signup" className="inline-flex items-center justify-center w-full h-12 mt-7 rounded-xl text-sm bg-[#252724] font-semibold text-white! transition hover:bg-[#3b3e39]">
                    Back to Signup
                </Link>
            </section>
        </main>
    );
}

export default Page
