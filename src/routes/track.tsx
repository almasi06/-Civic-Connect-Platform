import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { CATEGORY_LABEL, STATUS_LABEL, trackingOf } from "@/domain/types";
import { useRequests } from "@/hooks/use-requests";
import { deviceId } from "@/lib/device";

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>): { n?: string } =>
    typeof s.n === "string" ? { n: s.n.slice(0, 20) } : {},
  component: Track,
});

function Track() {
  const { n } = Route.useSearch();
  const all = useRequests();
  const [input, setInput] = useState(n ?? "");
  const [code, setCode] = useState("");
  const citizenId = deviceId();
  const ownReports = all.filter((request) => request.reporterDeviceId === citizenId);
  const normalizedCode = code.trim().toUpperCase();
  const matchingReports = normalizedCode
    ? ownReports.filter((request) => trackingOf(request) === normalizedCode)
    : ownReports;

  return (
    <AppShell>
      <h1>Track my reports</h1>
      <p className="muted">
        Your reports from this device are listed below. Search by tracking number to find a specific report.
      </p>
      <form
        className="row mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          setCode(input);
        }}
      >
        <input
          className="input grow"
          style={{ textTransform: "uppercase" }}
          placeholder="Search by tracking number (TSH-XXXXXX)"
          aria-label="Search your reports by tracking number"
          maxLength={20}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Search</button>
        {code && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setInput("");
              setCode("");
            }}
          >
            Show all
          </button>
        )}
      </form>

      {ownReports.length === 0 ? (
        <p className="muted mt-4">No reports from this device yet.</p>
      ) : matchingReports.length === 0 ? (
        <p className="muted mt-4">No report from this device matches that tracking number.</p>
      ) : (
        <section className="stack mt-4" aria-label="Your reports">
          <h2>{normalizedCode ? "Matching report" : `Your reports (${ownReports.length})`}</h2>
          {matchingReports.map((report) => (
            <article className="card stack" key={report.id}>
              <div className="row-between">
                <h3>{CATEGORY_LABEL[report.category]}</h3>
                <StatusBadge status={report.status} />
              </div>
              <p className="muted small">
                Tracking number: <strong>{trackingOf(report)}</strong>
                {" · "}Reported {new Date(report.createdAt).toLocaleString()}
              </p>
              {report.description && <p>{report.description}</p>}
              <details>
                <summary>Report progress</summary>
                <ul className="mt-2 small">
                  {report.history.map((entry, index) => (
                    <li key={`${entry.at}-${index}`}>
                      {new Date(entry.at).toLocaleString()} — {STATUS_LABEL[entry.status]}
                    </li>
                  ))}
                </ul>
              </details>
            </article>
          ))}
        </section>
      )}
    </AppShell>
  );
}