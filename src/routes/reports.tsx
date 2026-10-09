import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CityGate } from "@/components/CityGate";
import { RequestFilters } from "@/components/RequestFilters";
import { StatusBadge } from "@/components/StatusBadge";
import { CATEGORY_LABEL, trackingOf } from "@/domain/types";
import { queryRequests, type RequestQuery } from "@/domain/query";
import { useRequests } from "@/hooks/use-requests";
import { CITY } from "@/config/city";

export const Route = createFileRoute("/reports")({
  component: Reports,
});

function Reports() {
  const all = useRequests();
  const [filters, setFilters] = useState<RequestQuery>({});
  const filtered = queryRequests(all, filters);
  return (
    <AppShell>
      <CityGate>
        <h1>All reports in {CITY.name}</h1>
        {all.length > 0 && (
          <RequestFilters value={filters} onChange={setFilters} />
        )}
        {all.length === 0 && <p className="muted mt-4">No reports yet.</p>}
        {all.length > 0 && filtered.length === 0 && (
          <p className="muted mt-4" role="status">No reports match these filters.</p>
        )}
        <ul className="card-list">
          {filtered.map((r) => (
            <li key={r.id} className="report-row">
              {r.photo && <img src={r.photo} alt="" className="report-thumb" />}
              <div className="report-body">
                <div className="report-title-row">
                  <p className="report-title">{CATEGORY_LABEL[r.category]}</p>
                  <StatusBadge status={r.status} />
                </div>
                {r.description && <p className="small mt-2">{r.description}</p>}
                <p className="muted small mt-2">
                  Tracking number: <strong>{trackingOf(r)}</strong>
                </p>
                <p className="muted small mt-2">
                  Reported {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CityGate>
    </AppShell>
  );
}