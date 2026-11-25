import ReportDashboard from "./reports/ReportDashboard";

interface ReportProps {
  refreshKey?: number;
}

export function Report({ refreshKey = 0 }: ReportProps) {
  return <ReportDashboard refreshKey={refreshKey} />;
}
