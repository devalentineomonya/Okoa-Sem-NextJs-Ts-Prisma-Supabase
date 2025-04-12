"use client"

import { useState } from "react"
import { ChevronDown, Filter, Search} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", label: "(Select All)" },
  { id: "libs", label: "Libs and Components" },
  { id: "plugins", label: "Plugins and Extensions" },
  { id: "colors", label: "Colors and Customizations" },
  { id: "animations", label: "Animations" },
  { id: "tools", label: "Tools" },
  { id: "websites", label: "Websites and Portfolios Inspirations" },
  { id: "platforms", label: "Platforms" },
  { id: "ports", label: "Ports" },
]

export default function FilterDropdown() {
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-gray-800 bg-black text-white w-[180px] justify-between">
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            <span>Filter by category</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 bg-black border-gray-800">
        <div className="p-2 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input placeholder="Search..." className="pl-8 h-9 bg-black border-gray-800 focus:ring-0" />
          </div>
        </div>
        <div className="max-h-[300px] overflow-auto py-1">
          {categories.map((category) => (
            <button
              key={category.id}
              className="flex items-center px-2 py-1.5 hover:bg-gray-900 cursor-pointer"
              onClick={() => {
                setSelectedCategory(category.id === selectedCategory ? null : category.id)
                if (category.id === "all") setOpen(false)
              }}
            >
              <div
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full border mr-2",
                  selectedCategory === category.id ? "border-white" : "border-gray-700",
                )}
              >
                {selectedCategory === category.id && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
              <span className="text-sm">{category.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
