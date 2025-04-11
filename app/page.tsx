import { Suspense } from "react";
import { ResourceGrid } from "@/components/resource-grid";
import { getResources } from "@/lib/resources";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { LayoutType } from "@/components/resource-card";
import { getGridClasses } from "@/lib/helper";
import Hero from "@/components/home-hero";
import { SubmitCTA } from "@/components/cta-submit";
import type { Resource } from "@prisma/client";
import { ALLOWED_UNITS } from "@/lib/helper";
export default async function Home() {

  let resources: Resource[] = [];
  let error = null;
  function formatFallbackUnitName(value: string): string {
    return value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  try {
    const rowData = await getResources();
    resources = rowData.map((item) => {
      const unit = (ALLOWED_UNITS || []).find(
        (unit) => unit.value === item.unitName
      );
      return {
        ...item,
        unitName: unit?.label || formatFallbackUnitName(item.unitName),
      };
    });
  } catch (err) {
    console.error("Error loading resources:", err);
    error = err instanceof Error ? err : new Error("Unknown error occurred");
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Hero />

      {error ? (
        <ErrorState error={error} />
      ) : (
        <Suspense fallback={<ResourceGridSkeleton layoutType="grid" />}>
          <ResourceGrid resources={resources} />
        </Suspense>
      )}

      <SubmitCTA />
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="text-center py-12 space-y-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-destructive mb-4">
          Failed to Load Resources
        </h2>
        <p className="text-muted-foreground mb-4">Error: {error.message}</p>
        <p className="text-muted-foreground">
          This might be due to missing database setup or network issues.
        </p>
      </div>

      <div className="flex flex-col gap-4 items-center">
        <Button asChild>
          <Link href="/upload">Upload Initial Resource</Link>
        </Button>
      </div>
    </div>
  );
}

function ResourceGridSkeleton({
  layoutType = "grid",
}: {
  layoutType?: LayoutType;
}) {
  const getCardHeightClass = () => {
    switch (layoutType) {
      case "compact":
        return "h-[200px]";
      case "grid":
        return "h-[320px]";
      case "row":
        return "h-[140px]";
      default:
        return "h-[320px]";
    }
  };

  return (
    <div className={`grid ${getGridClasses(layoutType)}`}>
      {[...Array(12)].map((_, index) => (
        <Card key={index} className={`overflow-hidden ${getCardHeightClass()}`}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-16" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
