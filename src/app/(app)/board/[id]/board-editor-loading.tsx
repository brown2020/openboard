"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BoardEditorLoading() {
  return (

      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 border-b bg-background">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Skeleton className="h-10 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-[600px] rounded-xl" />
          </div>
        </div>
      </div>
    
  );
}
