"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBoards } from "@/hooks/use-boards";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TemplateCardPreview } from "@/components/templates/template-card-preview";
import { BOARD_TEMPLATES } from "@/lib/templates";
import { BoardTemplate, Block } from "@/types";
import { LayoutTemplate, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { generateUniqueSlug } from "@/lib/utils";

export default function TemplatesPage() {
  const { user } = useAuth();
  const { createBoard, updateBoard } = useBoards();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreating, setIsCreating] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const filteredTemplates = BOARD_TEMPLATES.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
  };

  const handleUseTemplate = async (template: BoardTemplate) => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsCreating(template.id);
    setCreateError(null);

    try {
      const slug = generateUniqueSlug(template.name);
      const board = await createBoard(template.name, slug);

      if (!board) {
        setCreateError("Could not create a board from this template. Please try again.");
        return;
      }

      const blocksWithIds = template.blocks.map((block, index) => ({
        ...block,
        id: `tmpl_${Date.now()}_${index}`,
      })) as Block[];

      await updateBoard(board.id, {
        blocks: blocksWithIds,
        theme: template.theme,
      });

      router.push(`/board/${board.id}`);
    } catch {
      setCreateError("Could not create a board from this template. Please try again.");
    } finally {
      setIsCreating(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Board Templates</h1>
              <p className="text-muted-foreground">
                Start with a professionally designed template
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/boards">My Boards</Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search templates"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter by category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="creator">Creator</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {createError && (
          <div
            className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {createError}
          </div>
        )}

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <LayoutTemplate
              className="w-12 h-12 mx-auto text-muted-foreground mb-4"
              aria-hidden="true"
            />
            <h2 className="text-xl font-semibold mb-2">No templates found</h2>
            <p className="text-muted-foreground mb-6">
              Try a different search term or category to browse all available
              templates.
            </p>
            <Button type="button" variant="outline" onClick={handleClearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <article
                key={template.id}
                className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all"
              >
                <TemplateCardPreview template={template} />

                <div className="p-4 bg-card">
                  <div className="mb-3">
                    <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted capitalize">
                      {template.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" aria-hidden="true" />
                      {template.usageCount.toLocaleString()} uses
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleUseTemplate(template)}
                    disabled={isCreating === template.id}
                  >
                    {isCreating === template.id
                      ? "Creating..."
                      : "Use This Template"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
