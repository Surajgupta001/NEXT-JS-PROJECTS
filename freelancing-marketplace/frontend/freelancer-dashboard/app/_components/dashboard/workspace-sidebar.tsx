"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarNavigation } from "./navigation";
import { getToken, useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

export function WorkspaceSidebar() {

  const pathname = usePathname();

  const { user, isLoaded } = useUser();

  const { data: profileMetaData, isLoading: profileMetaDataLoading } = useQuery({
    queryKey: ['profile-metadata'],
    enabled: Boolean(user),
    queryFn: async () => {
      const token = await getToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/freelancer/profile?role=freelancer`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch profile metadata');
      }

      return result.data;
    }
  });

  const profileLoading = !isLoaded || profileMetaDataLoading;

  const personalFields = [
    user?.firstName,
    user?.lastName,
    profileMetaData?.country,
    profileMetaData?.city,
  ];

  const professionalFields = [
    profileMetaData?.professional_title,
    profileMetaData?.professional_description,
    profileMetaData?.hourly_rate,
    profileMetaData?.availability_status,
    profileMetaData?.weekly_availability,
    profileMetaData?.experience_level,
  ];

  const skills = profileMetaData?.skills || [];
  const portfolios = profileMetaData?.portfolio || [];
  const completedLanguages = profileMetaData?.languages?.filter(
    (item: { language: string }) => item.language
  ).length ?? 0;
  const strength = Number((
    (user?.hasImage ? 10 : 0) +
    personalFields.filter(Boolean).length * 3.75 +
    professionalFields.filter(Boolean).length * 5 +
    Math.min(skills.length / 10, 1) * 15 +
    Math.min(completedLanguages / 3, 1) * 10 +
    Math.min(portfolios.length / 3, 1) * 20
  ).toFixed(2));

  const strengthSuggestions = [
    !user?.hasImage && "Add a profile photo",
    personalFields.some((field) => !field) && "Complete your personal details",
    professionalFields.some((field) => !field) && "Complete your professional details",
    skills.length < 10 && `Add ${10 - skills.length} more skills`,
    completedLanguages < 3 && `Add ${3 - completedLanguages} more languages`,
    portfolios.length < 3 && `Add ${3 - portfolios.length} more portfolio projects`,
  ].filter(Boolean) as string[];

  return (
    <aside className="grid gap-5 xl:sticky xl:top-24">
      {profileLoading ? (
        <section
          aria-label="Loading profile summary"
          aria-busy="true"
          className="p-5 bg-white border border-black/8 rounded-2xl"
        >
          <div className="animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full shrink-0 bg-[#dce3d9]" />
              <div className="flex-1">
                <div className="h-4 w-3/4 rounded-full bg-[#e1e5de]" />
                <div className="mt-2 h-3 w-1/3 rounded-full bg-[#e9ece6]" />
              </div>
            </div>
            <div className="flex justify-between mt-5">
              <div className="w-24 h-3 rounded-full bg-[#e1e5de]" />
              <div className="w-8 h-3 rounded-full bg-[#dce3d9]" />
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-[#e1e5de]" />
            <div className="mt-4 h-3 rounded-full bg-[#dce3d9]" />
          </div>
        </section>
      ) : (
        <section className="p-5 bg-white border rounded-2xl border-black/8">
          <div className="flex items-center gap-3">
            <Image
              src={user.imageUrl!}
              alt={user.fullName!}
              width={40}
              height={40}
              className='flex items-center justify-center object-cover w-12 h-12 rounded-full'
            />
            <div className="min-w-0">
              <h2 className="font-semibold truncate">{user?.fullName}</h2>
              <p className="truncate text-xs text-[#7b8078]">
                {profileMetaData?.professional_title}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-5 text-xs">
            <span className="font-medium">Profile strength</span>
            <strong className="text-[#52784f]">{strength}%</strong>
            {isLoaded && !profileMetaDataLoading && strength < 100 && (
              <span className="relative group">
                <button
                  type="button"
                  aria-label="how to complete your profile"
                  className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-[#789075] text-[10px] font-bold text-[#52784f]"
                >
                  ?
                </button>
                <span className="pointer-events-none absolute right-0 bottom-6 z-20 hidden w-56 rounded-xl bg-[#252724] p-3 text-left text-xs leading-5 font-normal text-white shadow-xl group-hover:block group-focus-within:block">
                  <strong className="block mb-1 font-semibold">
                    Reach 100%
                  </strong>
                  {strengthSuggestions.map((suggestion) => (
                    <span key={suggestion} className="block text-white/75">
                      • {suggestion}
                    </span>
                  ))}
                </span>
              </span>
            )}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e6e9e3]">
            <div
              className="h-full rounded-full bg-[#648b61]"
              style={{ width: `${strength}%` }}
            />
          </div>
          <Link
            href="/my-profile"
            className="mt-4 inline-block text-xs font-semibold text-[#4e774b] hover:underline"
          >
            Preview your profile
          </Link>
        </section >
      )}

      <nav className="p-2 text-sm bg-white border rounded-2xl border-black/8">
        {sidebarNavigation.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 font-medium transition ${active
                ? "bg-[#edf4ea] text-[#4e774b]"
                : "text-[#686d65] hover:bg-black/3"
                }`}
            >
              <Icon
                icon={
                  active
                    ? item.icon.replace("-linear", "-bold")
                    : item.icon
                }
                width="19"
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside >
  );
}
