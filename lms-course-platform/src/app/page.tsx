import { ThemeToggle } from "@/components/ui/themeToggle";

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-red-500">Welcome to the LMS</h1>
      <ThemeToggle />
    </div>
  );
}
