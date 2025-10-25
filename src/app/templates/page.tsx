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
import { BOARD_TEMPLATES } from "@/lib/templates";
import { BoardTemplate } from "@/types";
import { Search, Star, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function TemplatesPage() {
  const { user } = useAuth();
  const { createBoard } = useBoards();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreating, setIsCreating] = useState<string | null>(null);

  const filteredTemplates = BOARD_TEMPLATES.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = async (template: BoardTemplate) => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    setIsCreating(template.id);

    // Generate unique slug
    const slug = `${template.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
    const board = await createBoard(template.name, slug);

    if (board) {
      // Update board with template data
      // This would be done through the updateBoard function
      router.push(`/board/${board.id}`);
    }

    setIsCreating(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
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

      {/* Templates Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No templates found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Preview */}
                <div
                  className="h-48 p-6 relative"
                  style={{
                    background:
                      template.theme.background.type === "gradient"
                        ? template.theme.background.value
                        : template.theme.background.value,
                  }}
                >
                  {template.featured && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  )}
                  <h3
                    className="text-xl font-bold"
                    style={{ color: template.theme.textColor }}
                  >
                    Sample Board
                  </h3>
                  <div className="mt-4 space-y-2">
                    {template.blocks.slice(0, 2).map((block, idx) => {
                      const getBlockLabel = () => {
                        if (
                          block.type === "link" &&
                          "title" in block.settings
                        ) {
                          return block.settings.title as string;
                        }
                        if (
                          block.type === "button" &&
                          "text" in block.settings
                        ) {
                          return block.settings.text as string;
                        }
                        if (
                          block.type === "text" &&
                          "content" in block.settings
                        ) {
                          return (block.settings.content as string).slice(
                            0,
                            30
                          );
                        }
                        return `${block.type} block`;
                      };

                      return (
                        <div
                          key={idx}
                          className="p-2 rounded text-sm"
                          style={{
                            backgroundColor: template.theme.cardBackground,
                            color: template.theme.textColor,
                          }}
                        >
                          {getBlockLabel()}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Info */}
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
                      <TrendingUp className="w-3 h-3" />
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
