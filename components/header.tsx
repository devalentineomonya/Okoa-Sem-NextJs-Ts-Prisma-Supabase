"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Upload } from "lucide-react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/40 backdrop-blur px-4">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold flex items-center gap-x-2.5">
            <Image
            width={100}
            height={100}
              src="/logo.png"
              alt="Logo"
              className="hidden md:block h-10 w-auto"
            />
            <p>Okoa-Sem</p>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button asChild type="button" size="icon" variant="outline">
            <Link href="/upload">
              <Upload />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
