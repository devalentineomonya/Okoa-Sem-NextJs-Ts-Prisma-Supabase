"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { LayoutType, ResourceCard } from "@/components/resource-card";
import { AnimatePresence, motion } from "framer-motion";
import { SearchFilterControls } from "./search-filter";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowRight, Grid2X2, Grid3X3, List } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useDownloadedItems } from "@/hooks/use-downloads";
import type { Resource } from "@prisma/client";
import { toast } from "sonner";
import { PaginationControls } from "./pagination-controls";
import { Button } from "./ui/button";
import Link from "next/link";

interface ResourceGridProps {
  resources: Resource[];
}

const ITEMS_PER_PAGE_OPTIONS = [18, 27, 36, 45];

type SortOption =
  | "date-asc"
  | "date-desc"
  | "name-asc"
  | "name-desc"
  | "downloads";

const standardAnimations = {
  container: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3,
        delayChildren: 0.1,
        staggerChildren: 0.05,
      },
    },
    exit: { opacity: 0 },
  },
  emptyState: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

export function ResourceGrid({ resources }: ResourceGridProps) {
  const { downloadedItems, addDownload } = useDownloadedItems();

  const [layoutType, setLayoutType] = useState<LayoutType>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(
    ITEMS_PER_PAGE_OPTIONS[0]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [resourceType, setResourceType] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, resourceType, selectedCategories, sortOption]);

  // Derived state
  const categoryOptions = useMemo(
    () => [
      { label: "All", value: "all" },
      ...Array.from(new Set(resources.map((r) => r.resourceType))).map(
        (type) => ({ label: type, value: type })
      ),
    ],
    [resources]
  );

  const getGridClasses = useCallback(() => {
    switch (layoutType) {
      case "compact":
        return "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4";
      case "grid":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
      case "row":
        return "grid-cols-1 gap-4";
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
    }
  }, [layoutType]);

  // Filtering and sorting logic
  const filteredItems = useMemo(() => {
    let filtered = [...resources];

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.unitName.toLowerCase().includes(query) ||
          r.fileName.toLowerCase().includes(query)
      );
    }

    if (resourceType !== "all") {
      filtered = filtered.filter((r) => r.resourceType === resourceType);
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((r) =>
        selectedCategories.includes(r.resourceType)
      );
    }

    switch (sortOption) {
      case "date-asc":
        return filtered.sort(
          (a, b) => (a.yearCompleted || 0) - (b.yearCompleted || 0)
        );
      case "date-desc":
        return filtered.sort(
          (a, b) => (b.yearCompleted || 0) - (a.yearCompleted || 0)
        );
      case "name-asc":
        return filtered.sort((a, b) => a.unitName.localeCompare(b.unitName));
      case "name-desc":
        return filtered.sort((a, b) => b.unitName.localeCompare(a.unitName));
      case "downloads":
        return filtered.sort(
          (a, b) =>
            Number(downloadedItems.includes(b.id)) -
            Number(downloadedItems.includes(a.id))
        );
      default:
        return filtered;
    }
  }, [
    resources,
    debouncedSearchQuery,
    resourceType,
    selectedCategories,
    sortOption,
    downloadedItems,
  ]);

  // Pagination
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleDownload = async (id: string) => {
    const resource = resources.find((r) => r.id === id);
    if (!resource) return;

    const toastId = toast.loading("Preparing your download...");
    try {
      const response = await fetch(`/api/download?path=${resource.filePath}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = resource.fileName;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(link);

      addDownload(resource.id);
      toast.success("Download started successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to start download. Please try again.");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleLayoutChange = (value: LayoutType) => setLayoutType(value);

  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  }, []);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between gap-y-4 md:items-center md:flex-row flex-col">
        <SearchFilterControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryOptions={categoryOptions}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />

        <LayoutToggle layoutType={layoutType} onChange={handleLayoutChange} />
      </div>

      {filteredItems.length === 0 ? (
        <motion.div
          {...standardAnimations.emptyState}
          className="text-center py-12 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 sm:mt-6 mt-0"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 mb-4"
          >
            <svg
              className="w-8 h-8 text-neutral-500 dark:text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.div>
          <p className="text-muted-foreground text-lg font-medium">
            No items found matching your criteria.
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Try adjusting your search or filter settings.
          </p>

          <motion.div variants={itemVariants} className="w-full lg:w-auto">
            <Button asChild size="lg" className="w-full lg:w-auto text-base">
              <Link href="/upload" className="flex items-center justify-center">
                <span>Upload a Resource</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${layoutType}-${currentPage}`}
            className={`grid ${getGridClasses()}`}
            {...standardAnimations.container}
          >
            {paginatedItems.map((resource) => (
              <ResourceCard
                key={resource.id}
                layoutType={layoutType}
                onDownload={handleDownload}
                {...resource}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {filteredItems.length > 0 && (
        <>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            handlePageChange={handlePageChange}
            handleItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
          />

          <div className="text-sm text-muted-foreground text-center">
            Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, filteredItems.length)} of{" "}
            {filteredItems.length} items
          </div>
        </>
      )}
    </div>
  );
}

function LayoutToggle({
  layoutType,
  onChange,
}: {
  layoutType: LayoutType;
  onChange: (value: LayoutType) => void;
}) {
  return (
    <TooltipProvider>
      <ToggleGroup
        type="single"
        value={layoutType}
        onValueChange={onChange}
        className="bg-background/50 backdrop-blur-sm border rounded-md"
      >
        <Tooltip>
          <TooltipTrigger>
            <ToggleGroupItem value="compact">
              <Grid3X3 className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Compact View</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <ToggleGroupItem value="grid">
              <Grid2X2 className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Grid View</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <ToggleGroupItem value="row">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>List View</TooltipContent>
        </Tooltip>
      </ToggleGroup>
    </TooltipProvider>
  );
}
