import Sort, { SortOption } from "@/components/sort-dropdown";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { motion } from "framer-motion";
import type React from "react";
import { useCallback } from "react";

interface SearchFilterControlsProps {
  readonly searchQuery: string;
  readonly setSearchQuery: (query: string) => void;
  readonly categoryOptions: { label: string; value: string }[];
  readonly selectedCategories: string[];
  readonly setSelectedCategories: (categories: string[]) => void;
  readonly sortOption: SortOption;
  readonly onSortChange: (option: SortOption) => void;
}

export function SearchFilterControls({
  searchQuery,
  setSearchQuery,
  categoryOptions,
  selectedCategories,
  setSelectedCategories,
  sortOption,
  onSortChange,
}: SearchFilterControlsProps) {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  return (
    <motion.div
      className="flex flex-col sm:flex-row justify-between items-center gap-4"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delay: 0.2,
          },
        },
      }}
    >
      <Input
        type="text"
        placeholder="Search items..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="w-full sm:w-56 md:w-64"
      />
      <div className="w-full sm:w-auto flex flex-col gap-y-4 sm:flex-row items-center gap-4">
        <MultiSelect
          options={categoryOptions}
          value={selectedCategories}
          onValueChange={setSelectedCategories}
          placeholder="Filter by category"
          className="w-full sm:w-56 md:w-64"
        />
        <Sort sortOption={sortOption} onSortChange={onSortChange} />
      </div>
    </motion.div>
  );
}
