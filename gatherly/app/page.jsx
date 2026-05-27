import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative pb-16 overflow-hidden">
        <div className="relative z-10 grid items-center gap-12 mx-auto max-w-7xl lg:grid-cols-2">
          {/* Left Content*/}
          <div className="text-center sm:text-left">
            <div className="mb-6">
              <span className="text-2xl font-light tracking-wide text-gray-500">
                Gatherly<span className="text-purple-400">*</span>
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[0.95] tracking-tight">
              Discover &<br />
              create amazing
              <br />
              <span className="text-transparent bg-linear-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text">
                events.
              </span>
            </h1>
            <p className="max-w-lg mb-12 text-lg font-light text-gray-400 sm:text-xl">
              Whether you&apos;re hosting or attending, Spott makes every event
              memorable. Join our community today.
            </p>
            <Link href="/explore">
              <Button size="xl" className={"rounded-full"}>
                Get Started
              </Button>
            </Link>
          </div>
          {/* Right Content - 3D Phone Mockup*/}
          <div className="overflow-hidden">
            <Image
              // src="/hero.png"
              src="/hero.gif"
              alt="hero img"
              width={700}
              height={700}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>
    </div>
  );
}
