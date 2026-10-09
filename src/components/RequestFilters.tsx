import { Search } from "lucide-react";
import {
  CATEGORY_LABEL, DEPARTMENT_LABEL, STATUS_LABEL,
  type Category, type Department, type Status,
} from "@/domain/types";
import type { RequestQuery, SortKey } from "@/domain/query";

export function RequestFilters({
  value,
  onChange,
  showDepartment = true,
  extraSorts = [],
}: {
  value: RequestQuery;
  onChange: (v: RequestQuery) => void;
  showDepartment?: boolean;
  extraSorts?: SortKey[];
}) {
  const set = (p: Partial<RequestQuery>) => onChange({ ...value, ...p });

  return (
    <div className="filters">
      <label className="search-wrap">
        <Search size={16} className="muted" />
        <input
          placeholder="Search by tracking number, problem or words"
          aria-label="Search reports"
          value={value.q ?? ""}
          maxLength={100}
          onChange={(e) => set({ q: e.target.value })}
        />
      </label>

      <div className="form-grid">
        <select
          aria-label="Status"
          className="select"
          value={value.status ?? "any"}
          onChange={(e) => set({ status: e.currentTarget.value })}
        >
          <option value="any">Any status</option>
          <option value="open">Still open</option>
          {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>

        <select
          aria-label="Problem"
          className="select"
          value={value.category ?? "any"}
          onChange={(e) => set({ category: e.currentTarget.value })}
        >
          <option value="any">Any problem</option>
          {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
            <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
          ))}
        </select>

        {showDepartment && (
          <select
            aria-label="Department"
            className="select"
            value={value.department ?? "any"}
            onChange={(e) => set({ department: e.currentTarget.value })}
          >
            <option value="any">Any department</option>
            {(Object.keys(DEPARTMENT_LABEL) as Department[]).map((d) => (
              <option key={d} value={d}>{DEPARTMENT_LABEL[d]}</option>
            ))}
          </select>
        )}

        <select
          aria-label="Sort"
          className="select"
          value={value.sort ?? "newest"}
          onChange={(e) => {
            const sort = e.currentTarget.value;
            if (
              sort === "newest" ||
              sort === "oldest" ||
              sort === "updated" ||
              sort === "category" ||
              sort === "status" ||
              (sort === "distance" && extraSorts.includes("distance"))
            ) {
              set({ sort });
            }
          }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="updated">Recently updated</option>
          <option value="category">By problem</option>
          <option value="status">By status</option>
          {extraSorts.includes("distance") && <option value="distance">Nearest first</option>}
        </select>
      </div>
    </div>
  );
}