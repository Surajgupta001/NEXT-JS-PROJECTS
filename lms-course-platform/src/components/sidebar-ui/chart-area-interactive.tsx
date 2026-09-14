"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  enrollments: {
    label: "Enrollments",
    color: 'var(--color-primary)',
  }
} satisfies ChartConfig

interface ChartAreaInterfaceProps {
  data: {
    date: string;
    enrollments: number;
  }[];
}

export function ChartAreaInteractive({ data }: ChartAreaInterfaceProps) {

  const totalEnrollmentsNumber = React.useMemo(
    () => data.reduce((acc, curr) => acc + curr.enrollments, 0),
    [data]
  );

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Enrollments</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">Total Enrollments for the last 30 days: {totalEnrollmentsNumber}</span>
          <span className="@[540px]/card:hidden">Last 30 days: {totalEnrollmentsNumber}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
          <BarChart
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={'preserveStartEnd'}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-37.5"
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                />
              }
            />
            <Bar dataKey={'enrollments'} fill='var(--color-primary)' />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
