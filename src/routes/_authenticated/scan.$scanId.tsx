import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingLeaf } from "@/components/loading-leaf";
import { ScanResultView } from "@/components/scan-result-view";
import { getScan } from "@/lib/scan.functions";

export const Route = createFileRoute("/_authenticated/scan/$scanId")({
  head: () => ({
    meta: [
      { title: "Scan result — CropGuard AI" },
      { name: "description", content: "Your AI crop diagnosis and treatment plan." },
    ],
  }),
  component: ScanResult,
});

function ScanResult() {
  const { scanId } = Route.useParams();
  const getFn = useServerFn(getScan);
  const scan = useQuery({
    queryKey: ["scan", scanId],
    queryFn: () => getFn({ data: { id: scanId } }),
  });

  if (scan.isLoading) {
    return <div className="grid min-h-[60vh] place-items-center"><LoadingLeaf size={64} /></div>;
  }
  if (scan.error || !scan.data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Scan not found.</p>
        <Button asChild variant="outline" className="mt-4 rounded-2xl"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="rounded-xl">
          <Link to="/dashboard"><ArrowLeft className="mr-1 h-4 w-4" /> Dashboard</Link>
        </Button>
      </div>
      <ScanResultView scan={scan.data as any} imageUrl={scan.data.imageUrl} />
    </div>
  );
}
