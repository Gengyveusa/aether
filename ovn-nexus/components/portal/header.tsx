"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Settings, Bell, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
  user?: { full_name: string; role: string; email: string } | null;
}

interface SearchResults {
  patients: { id: string; patient_code: string; clinic_id: string }[];
  experiments: { id: string; experiment_code: string; title: string }[];
  datasets: { id: string; name: string; dataset_type: string }[];
  papers: { id: string; title: string; doi: string }[];
  trials: { id: string; trial_code: string; title: string }[];
}

const CATEGORY_CONFIG: {
  key: keyof SearchResults;
  label: string;
  href: (item: any) => string;
  display: (item: any) => string;
}[] = [
  {
    key: "patients",
    label: "Patients",
    href: (item) => `/patients/${item.id}`,
    display: (item) => item.patient_code,
  },
  {
    key: "experiments",
    label: "Experiments",
    href: (item) => `/experiments/${item.id}`,
    display: (item) => item.title || item.experiment_code,
  },
  {
    key: "datasets",
    label: "Datasets",
    href: (item) => `/datasets/${item.id}`,
    display: (item) => item.name,
  },
  {
    key: "papers",
    label: "Papers",
    href: (item) => `/papers/${item.id}`,
    display: (item) => item.title,
  },
  {
    key: "trials",
    label: "Clinical Trials",
    href: (item) => `/trials/${item.id}`,
    display: (item) => item.title || item.trial_code,
  },
];

export function Header({ user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults(null);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    setShowDropdown(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(value), 300);
  }

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Close dropdown on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowDropdown(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const hasResults =
    searchResults &&
    CATEGORY_CONFIG.some((cat) => (searchResults[cat.key] || []).length > 0);

  const totalResults = searchResults
    ? CATEGORY_CONFIG.reduce((sum, cat) => sum + (searchResults[cat.key] || []).length, 0)
    : 0;

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="shrink-0">
        <h2 className="text-sm font-medium text-muted-foreground">
          Welcome back{user ? `, ${user.full_name}` : ""}
        </h2>
      </div>

      {/* Search bar */}
      <div className="relative mx-4 w-full max-w-md" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search patients, experiments, datasets..."
            className="pl-9 pr-4"
            value={searchQuery}
            onChange={onInputChange}
            onFocus={() => {
              if (searchResults && searchQuery.length >= 2) setShowDropdown(true);
            }}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search results dropdown */}
        {showDropdown && searchQuery.length >= 2 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[400px] overflow-y-auto rounded-lg border bg-popover shadow-lg">
            {isSearching && !searchResults && (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </div>
            )}

            {!isSearching && searchResults && !hasResults && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found for &quot;{searchQuery}&quot;
              </div>
            )}

            {searchResults && hasResults && (
              <div className="py-1">
                {CATEGORY_CONFIG.map((cat) => {
                  const items = searchResults[cat.key] || [];
                  if (items.length === 0) return null;
                  return (
                    <div key={cat.key}>
                      <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {cat.label}
                      </div>
                      {items.map((item: any) => (
                        <Link
                          key={item.id}
                          href={cat.href(item)}
                          onClick={() => {
                            setShowDropdown(false);
                            setSearchQuery("");
                            setSearchResults(null);
                          }}
                          className="block px-3 py-2 text-sm hover:bg-accent transition-colors"
                        >
                          {cat.display(item)}
                        </Link>
                      ))}
                    </div>
                  );
                })}
                <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                  {totalResults} result{totalResults !== 1 ? "s" : ""} found
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
        <form action="/api/auth/signout" method="POST">
          <Button variant="ghost" size="icon" type="submit">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
        {user && (
          <div className="ml-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{user.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
