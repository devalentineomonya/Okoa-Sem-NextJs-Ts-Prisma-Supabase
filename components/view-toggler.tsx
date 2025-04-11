"use client"

import { useState } from "react"
import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function ViewToggle() {
  const [view, setView] = useState<"grid" | "list">("grid")

  return (
    <div className="flex border border-gray-800 rounded-md overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        className={cn("rounded-none h-10 w-10", view === "grid" ? "bg-gray-800" : "bg-transparent hover:bg-gray-900")}
        onClick={() => setView("grid")}
      >
        <LayoutGrid className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("rounded-none h-10 w-10", view === "list" ? "bg-gray-800" : "bg-transparent hover:bg-gray-900")}
        onClick={() => setView("list")}
      >
        <List className="h-5 w-5" />
      </Button>
    </div>
  )
}
