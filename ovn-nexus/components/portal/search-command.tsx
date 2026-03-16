"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2, Users, FlaskConical, Database, FileText, Pill } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface SearchResults {
  patients: Array<{ id: string; patient_code: string }>;
  experiments: Array<{ id: string; experiment_code: string; title: string }>;
  datasets: Array<{ id: string; name: string; dataset_type: string }>;
  papers: Array<{ id: string; title: string; doi: string | null }>;
  trials: Array<{ id: string; trial_code: string; title: string }>;
}

const CATEGORY_CONFIG = {
  patients: { label: "Patients", icon: Users, path: "/patients" },
  experiments: { label: "Experiments", icon: FlaskConical, path: "/experiments" },
  datasets: { label: "Datasets", icon: Database, path: "/datasets" },
  papers: { label: "Papers", icon: FileText, path: "/papers" },
  trials: { label: "Trials", icon: Pill, path: "/trials" },
} as const;

function getResultLabel(category: keyof SearchResults, item: Record<string, unknown>): string {
  switch (category) {
    case "patients":
      return item.patient_code as string;
    case "experiments":
      return `${item.experiment_code} - ${item.title}`;
    case "datasets":
      return item.name as string;
    case "papers":
      return item.title as string;
    case "trials":
      return `${item.trial_code} - ${item.title}`;
    default:
      return String(item.id);
  }
}

export function SearchCommand() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (res.ok) {
        const data: SearchResults = await res.json();
        setResults(data);
        setIsOpen(true);
      }
    } catch {
      // Silently handle search errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      search(value);
    }, 300);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const totalResults = results
    ? Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
    : 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search patients, experiments, papers..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results && totalResults > 0) setIsOpen(true);
          }}
          className="rounded-full pl-9 pr-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && results && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-[420px] overflow-y-auto rounded-lg border bg-popover shadow-lg">
          {totalResults === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
              <Search className="mb-2 h-5 w-5" />
              <p>No results found for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            <div className="p-1">
              {(Object.keys(CATEGORY_CONFIG) as Array<keyof SearchResults>).map((category) => {
                const items = results[category];
                if (!items || items.length === 0) return null;

                const config = CATEGORY_CONFIG[category];
                const Icon = config.icon;

                return (
                  <div key={category} className="mb-1 last:mb-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Icon className="h-3.5 w-3.5" />
                      {config.label}
                      <Badge variant="secondary" className="ml-auto h-5 text-[10px]">
                        {items.length}
                      </Badge>
                    </div>
                    {items.map((item) => (
                      <Link
                        key={item.id}
                        href={`${config.path}/${item.id}`}
                        onClick={() => {
                          setIsOpen(false);
                          setQuery("");
                        }}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                        )}
                      >
                        <span className="line-clamp-1">
                          {getResultLabel(category, item as unknown as Record<string, unknown>)}
                        </span>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
