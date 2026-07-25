import { SystemReport } from "@/types";
import { apiGet } from "@/lib/apiClient";

export const ReportService = {
  /** Admin-only: fetches the aggregated system report from the database. */
  async generate(): Promise<SystemReport> {
    const { report } = await apiGet<{ report: SystemReport }>("/api/dashboard/report");
    return report;
  },
};
