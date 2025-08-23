import { connectToDatabase } from "@/lib/database";
import Video from "@/models/video";
import type { IVideo } from "@/models/video";
import Link from "next/link";

export default async function Home() {
  await connectToDatabase();
  const videos = await Video.find({}).sort({ createdAt: -1 }).lean();
  type VideoItem = IVideo & { _id: unknown };
  const list = videos as unknown as VideoItem[];

  return (
    <main className="w-full min-h-screen px-4 py-10 bg-gray-50 dark:bg-neutral-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Videos</h1>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Upload
          </Link>
        </div>

        {(!list || list.length === 0) ? (
          <div className="text-gray-600 dark:text-gray-300">No videos yet.</div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((v) => (
              <li key={String(v._id)} className="p-4 bg-white shadow rounded-xl dark:bg-neutral-800">
                <div className="w-full overflow-hidden bg-black rounded-lg aspect-video">
                  <video
                    src={v.videoUrl}
                    controls={v.controls}
                    className="object-contain w-full h-full"
                  />
                </div>
                <h2 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">{v.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{v.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
