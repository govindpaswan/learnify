import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, X } from "lucide-react";
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
      .then(r => { setCourses(r.data.data); setPagination(r.data.pagination); })
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
    p.delete("page");
    setSearchParams(p);
  };

  const clearFilters = () => setSearchParams({});
  const hasFilters = search || category || level;

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="section-title mb-2">Browse All Courses</h1>
        <p className="text-slate-500 dark:text-slate-400">Discover {pagination.total || 0}+ courses taught by expert instructors</p>
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
          <Filter size={16} /> Filters {hasFilters && <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">!</span>}
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

      {/* Grid */}
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

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setParam("page", i + 1)}
              className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${page === i + 1 ? "bg-primary-600 text-white" : "btn-secondary"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
