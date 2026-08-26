import { ChartAreaInteractive } from "@/components/sidebar-ui/chart-area-interactive";
import { DataTable } from "@/components/sidebar-ui/data-table";
import { SectionCards } from "@/components/sidebar-ui/section-cards";

import data from "./data.json"

export default function AdminIndexPage() {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </>
  )
}
