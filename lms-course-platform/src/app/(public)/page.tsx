import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface featureProps {
    title: string;
    description: string;
    icon: string;
};

const features: featureProps[] = [
    {
        title: "Comprehensive Courses",
        description:
            "Access a wide range of carefully curated courses designed by industry experts to help you build practical and in-demand skills.",
        icon: "📚",
    },
    {
        title: "Interactive Learning",
        description:
            "Engage with interactive lessons, quizzes, assignments, and practical exercises to make learning more effective and enjoyable.",
        icon: "🎯",
    },
    {
        title: "Learn at Your Own Pace",
        description:
            "Study whenever and wherever you want with flexible learning paths designed around your schedule and personal goals.",
        icon: "⏱️",
    },
    {
        title: "Track Your Progress",
        description:
            "Monitor your learning journey, track completed lessons, and stay motivated as you work toward completing your courses.",
        icon: "📈",
    },
    {
        title: "Practical Projects",
        description:
            "Put your knowledge into practice through real-world projects that help you develop experience and build a strong portfolio.",
        icon: "💻",
    },
    {
        title: "Earn Certificates",
        description:
            "Complete courses and showcase your achievements with certificates that demonstrate your newly developed skills.",
        icon: "🏆",
    },
    {
        title: "Expert Instructors",
        description:
            "Learn from experienced instructors who bring practical knowledge, industry insights, and real-world expertise to every course.",
        icon: "👨‍🏫",
    },
    {
        title: "Community & Support",
        description:
            "Connect with fellow learners, ask questions, share knowledge, and get the support you need throughout your learning journey.",
        icon: "🤝",
    },
];

export default function Home() {

    return (
        <>
            <section className="relative py-20">
                <div className="flex flex-col items-center space-y-8 text-center">
                    <Badge variant="outline">Your Learning Journey Starts Here</Badge>
                    <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                        Learn Better. Build More. Grow Faster.
                    </h1>
                    <p className="text-muted-foreground md:text-xl max-w-175">
                        Explore practical courses, build real-world skills, and turn your knowledge into meaningful results.
                    </p>
                    <div className="flex flex-col gap-4 mt-8 sm:flex-row">
                        <Link href='/courses' className={buttonVariants({ size: 'lg' })}>
                            Explore Courses
                        </Link>
                        <Link href='/login' className={buttonVariants({ size: 'lg', variant: 'outline' })}>
                            Get Started
                        </Link>
                    </div>
                </div>
            </section>
            <section className="grid grid-cols-1 gap-6 mb-32 md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => (
                    <Card key={index} className="transition-shadow hover:shadow-lg">
                        <CardHeader>
                            <div className="mb-4 text-4xl">{feature.icon}</div>
                            <CardTitle>{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </section>
        </>
    );
}
