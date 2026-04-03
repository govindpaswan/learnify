import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../utils/api";
import CourseCard from "../components/common/CourseCard";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilter, setShowFilter] = useState(false);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const level = searchParams.get("level") || "";
  const page = parseInt(searchParams.get("page") || "1");

  const fetchCourses = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (level) params.set("level", level);
    api.get(`/courses?${params}`)
      .then(r => {
        setCourses(r.data.data);
        setPagination(r.data.pagination);
        // ✅ FIX: Scroll to top on page change
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, level, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  useEffect(() => {
    api.get("/courses/categories").then(r => setCategories(r.data.data)).catch(() => {});
  }, []);

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    if (key !== "page") p.delete("page");
    setSearchParams(p);
  };

  // ✅ FIX: Dedicated page setter
  const goToPage = (newPage) => {
    const p = new URLSearchParams(searchParams);
    p.set("page", String(newPage));
    setSearchParams(p);
  };

  const clearFilters = () => setSearchParams({});
  const hasFilters = search || category || level;
  const totalPages = pagination.pages || 1;

  // Generate page numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="section-title mb-2">Browse All Courses</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Discover {pagination.total || 0}+ courses taught by expert instructors
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search courses, topics, instructors..."
            value={search}
            onChange={e => setParam("search", e.target.value)}
          />
        </div>
        <button onClick={() => setShowFilter(!showFilter)} className="btn-secondary gap-2 shrink-0">
          <Filter size={16} /> Filters
          {hasFilters && (
            <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">!</span>
          )}
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="btn-secondary text-red-500 hover:text-red-600 shrink-0">
            <X size={16} /> Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="card p-5 mb-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={category} onChange={e => setParam("category", e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select className="input" value={level} onChange={e => setParam("level", e.target.value)}>
                <option value="">All Levels</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton aspect-video" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 w-20" />
                <div className="skeleton h-5 w-full" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="font-display font-semibold text-xl text-slate-700 dark:text-slate-300 mb-2">No courses found</h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="btn-primary mt-4">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map(c => <CourseCard key={c._id} course={c} />)}
        </div>
      )}

      {/* ✅ FIX: Pagination with proper click handler */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          {/* Prev button */}
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="w-10 h-10 rounded-lg btn-secondary flex items-center justify-center disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-slate-400">...</span>
            ) : (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                  page === p
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-110"
                    : "btn-secondary hover:bg-primary-50 dark:hover:bg-primary-900/20"
                }`}
              >
                {p}
              </button>
            )
          )}

          {/* Next button */}
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="w-10 h-10 rounded-lg btn-secondary flex items-center justify-center disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Page info */}
      {totalPages > 1 && (
        <p className="text-center text-sm text-slate-400 mt-3">
          Page {page} of {totalPages} — {pagination.total} courses
        </p>
      )}
    </div>
  );
}
