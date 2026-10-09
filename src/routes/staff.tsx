import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import { MapPin } from "lucide-react";
import {
  currentStaff,
  fetchFieldWorkers,
  type FieldWorker,
  type StaffSession,
} from "@/application/auth";
import { listMyTeams, listTeams, removeTeam, saveTeam, type TeamInput, type WorkerTeam } from "@/application/teams";
import { AppShell } from "@/components/AppShell";
import { RequestFilters } from "@/components/RequestFilters";
import { StatusBadge } from "@/components/StatusBadge";
import { useRequests } from "@/hooks/use-requests";
import {
  assignedWorkerIdsOf,
  CATEGORY_LABEL,
  DEPARTMENT_COLOR,
  DEPARTMENT_LABEL,
  departmentOf,
  isAssignedToWorker,
  isOpen,
  STATUS_LABEL,
  trackingOf,
  type Department,
  type ServiceRequest,
  type Team,
} from "@/domain/types";
import { queryRequests, type RequestQuery } from "@/domain/query";
import { nextStatuses, transition } from "@/domain/workflow";
import { requestRepository } from "@/persistence/requestRepository";

const FaultMap = lazy(() => import("@/components/FaultMap"));
const CITY_CALL_CENTRE = { label: "(012) 358 9999", href: "tel:+27123589999" };

export const Route = createFileRoute("/staff")({
  component: StaffLanding,
});

function StaffLanding() {
  const nav = useNavigate();
  const [staff] = useState(() => currentStaff());

  useEffect(() => {
    if (!staff) {
      void nav({ to: "/login" });
    } else if (staff.role === "admin") {
      void nav({ to: "/admin" });
    } else {
      void nav({ to: "/worker" });
    }
  }, [staff, nav]);

  return null;
}

export function StaffDashboard({ role }: { role: StaffSession["role"] }) {
  const all = useRequests();
  const nav = useNavigate();
  const [staff] = useState<StaffSession | null>(() => currentStaff());
  const [workers, setWorkers] = useState<FieldWorker[]>([]);
  const [myTeams, setMyTeams] = useState<WorkerTeam[]>([]);
  const [filters, setFilters] = useState<RequestQuery>({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!staff) {
      void nav({ to: "/login" });
      return;
    }
    if (staff.role !== role) {
      void nav({ to: staff.role === "admin" ? "/admin" : "/worker" });
      return;
    }
    if (role === "admin") {
      void fetchFieldWorkers().then(setWorkers).catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Could not load field workers.");
      });
    } else {
      void listMyTeams().then(setMyTeams).catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Could not load your team details.");
      });
    }
  }, [staff, role, nav]);

  if (!staff || staff.role !== role) return null;
  if (role === "admin") {
    return (
      <AppShell>
        <AdminDashboard
          requests={all}
          staff={staff}
          workers={workers}
          onError={setError}
          error={error}
        />
      </AppShell>
    );
  }
  const assignedRequests = all.filter((request) => isAssignedToWorker(request, staff.id));
  const visibleRequests = queryRequests(assignedRequests, filters);
  const locationPoints = visibleRequests.map((request) => ({
    id: request.id,
    lat: request.lat,
    lng: request.lng,
    color: DEPARTMENT_COLOR[departmentOf(request)],
    label: `${CATEGORY_LABEL[request.category]} · ${trackingOf(request)}`,
  }));

  return (
    <AppShell>
      <div className="stack">
        <div>
          <h1>Field worker dashboard</h1>
          <p className="muted">
            Signed in as {staff.name} (field worker).
          </p>
        </div>
        {error && <p role="alert" className="field-error api-error">{error}</p>}
        <WorkerAssignmentNotifications requests={assignedRequests} staff={staff} teams={myTeams} />
        {assignedRequests.length > 0 && (
          <WorkerLocationDashboard requests={visibleRequests} points={locationPoints} />
        )}
        <section className="stack mt-4">
          <h2>
            Jobs assigned to you ({visibleRequests.length} of {assignedRequests.length})
          </h2>
          <RequestFilters value={filters} onChange={setFilters} />
          {visibleRequests.length === 0 && (
            <p className="muted">
              {assignedRequests.length === 0
                ? "No jobs are assigned to you yet."
                : "No assigned reports match your search or filters."}
            </p>
          )}
          {visibleRequests.map((request) => (
            <StaffRequest
              key={request.id}
              request={request}
              staff={staff}
              teamName={myTeams.find((team) => team.department === departmentOf(request))?.name
                ?? (myTeams.length === 1
                  ? myTeams[0].name
                  : DEPARTMENT_LABEL[departmentOf(request)])}
              onError={setError}
            />
          ))}
        </section>
      </div>
    </AppShell>
  );
}

function WorkerLocationDashboard({
  requests,
  points,
}: {
  requests: ServiceRequest[];
  points: { id: string; lat: number; lng: number; color: string; label: string }[];
}) {
  if (requests.length === 0) return null;

  return (
    <section className="card stack worker-location-dashboard" aria-labelledby="worker-location-title">
      <div>
        <h2 id="worker-location-title">Assigned report locations</h2>
        <p className="muted small">
          Map markers show the issue type and tracking number. The list includes each report location.
        </p>
      </div>
      <Suspense fallback={<p className="muted">Loading report map…</p>}>
        <FaultMap points={points} height={300} />
      </Suspense>
      <ul className="worker-location-list">
        {requests.map((request) => (
          <li key={request.id}>
            <MapPin size={18} aria-hidden="true" />
            <div>
              <strong>{CATEGORY_LABEL[request.category]}</strong>
              <span className="muted small">{trackingOf(request)}</span>
              <span className="muted small">
                {request.lat.toFixed(5)}, {request.lng.toFixed(5)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function WorkerAssignmentNotifications({
  requests,
  staff,
  teams,
}: {
  requests: ServiceRequest[];
  staff: StaffSession;
  teams: WorkerTeam[];
}) {
  const ledReports = requests.filter((request) => request.teamLeaderId === staff.id);
  if (ledReports.length === 0) return null;

  return (
    <section className="card stack worker-assignment-notices" aria-labelledby="assignment-notices-title">
      <h2 id="assignment-notices-title">New team-leader assignments</h2>
      {ledReports.map((request) => {
        const department = departmentOf(request);
        const team = teams.find((candidate) => candidate.department === department);
        return (
          <article className="worker-assignment-notice" key={request.id}>
            <strong>{trackingOf(request)} · {CATEGORY_LABEL[request.category]}</strong>
            <span>{DEPARTMENT_LABEL[department]}</span>
            <span className="small">
              Department email: {team?.contactEmail
                ? <a href={`mailto:${team.contactEmail}`}>{team.contactEmail}</a>
                : "not provided"}
              {" · "}
              Phone: {team?.contactPhone
                ? <a href={`tel:${team.contactPhone}`}>{team.contactPhone}</a>
                : <>not provided · General City call centre: <a href={CITY_CALL_CENTRE.href}>{CITY_CALL_CENTRE.label}</a></>}
            </span>
          </article>
        );
      })}
      <p className="muted small">These in-app notices are shown instead of email notifications.</p>
    </section>
  );
}

type AdminTab = "Dashboard" | "Map" | "Team" | "Tickets";
type DashboardPeriod = "week" | "month" | "year";

function localDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPeriodBounds(date: Date, period: DashboardPeriod) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (period === "week") {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  } else if (period === "month") {
    start.setDate(1);
  } else {
    start.setMonth(0, 1);
  }
  const end = new Date(start);
  if (period === "week") end.setDate(end.getDate() + 7);
  else if (period === "month") end.setMonth(end.getMonth() + 1);
  else end.setFullYear(end.getFullYear() + 1);
  return {
    start,
    end,
    days: Math.round((end.getTime() - start.getTime()) / 86_400_000),
  };
}

function dateKey(date: Date) {
  return localDateInputValue(date);
}

function AdminDashboard({
  requests,
  staff,
  workers,
  onError,
  error,
}: {
  requests: ServiceRequest[];
  staff: StaffSession;
  workers: FieldWorker[];
  onError: (message: string) => void;
  error: string;
}) {
  const [tab, setTab] = useState<AdminTab>("Dashboard");
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    let active = true;
    void listTeams()
      .then((result) => {
        if (active) setTeams(result);
      })
      .catch((reason: unknown) => {
        if (active) onError(reason instanceof Error ? reason.message : "Could not load teams.");
      });
    return () => {
      active = false;
    };
  }, [onError]);

  return (
    <div className="stack admin-dashboard">
      <header className="admin-dashboard-heading">
        <div>
          <h1>Administrator dashboard</h1>
          <p className="muted">Signed in as {staff.name}. Manage team assignments and review service reports.</p>
        </div>
      </header>
      <nav className="admin-tabs" aria-label="Administrator sections" role="tablist">
        {(["Dashboard", "Map", "Team", "Tickets"] as const).map((item) => (
          <button
            key={item}
            id={`admin-tab-${item.toLowerCase()}`}
            type="button"
            role="tab"
            aria-selected={tab === item}
            aria-controls="admin-tab-panel"
            className={`admin-tab${tab === item ? " is-active" : ""}`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      {error && <p role="alert" className="field-error api-error">{error}</p>}
      <section id="admin-tab-panel" role="tabpanel" aria-labelledby={`admin-tab-${tab.toLowerCase()}`}>
        {tab === "Dashboard" && <AdminOverview requests={requests} />}
        {tab === "Map" && <AdminActiveMap requests={requests} />}
        {tab === "Team" && (
          <div className="stack">
            <TeamManager workers={workers} onError={onError} onTeamsChange={setTeams} />
            <TeamAssignmentPanel
              requests={requests}
              workers={workers}
              teams={teams}
              staff={staff}
              onError={onError}
            />
          </div>
        )}
        {tab === "Tickets" && <AdminTickets requests={requests} workers={workers} teams={teams} />}
      </section>
    </div>
  );
}

function AdminOverview({ requests }: { requests: ServiceRequest[] }) {
  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const [selectedDate, setSelectedDate] = useState(() => localDateInputValue(new Date()));
  const anchor = new Date(`${selectedDate}T12:00:00`);
  const bounds = getPeriodBounds(anchor, period);
  const inPeriod = requests.filter((request) => {
    const created = new Date(request.createdAt);
    return created >= bounds.start && created < bounds.end;
  });
  const currentWeek = getPeriodBounds(new Date(), "week");
  const currentMonth = getPeriodBounds(new Date(), "month");
  const weekCount = requests.filter((request) => {
    const created = new Date(request.createdAt);
    return created >= currentWeek.start && created < currentWeek.end;
  }).length;
  const monthCount = requests.filter((request) => {
    const created = new Date(request.createdAt);
    return created >= currentMonth.start && created < currentMonth.end;
  }).length;
  const departmentCounts = (Object.keys(DEPARTMENT_LABEL) as Department[]).map((department) => ({
    department,
    count: inPeriod.filter((request) => departmentOf(request) === department).length,
  }));
  const averagePerDay = bounds.days ? inPeriod.length / bounds.days : 0;
  const year = anchor.getFullYear();

  return (
    <div className="stack">
      <div className="admin-metric-grid">
        <article className="admin-metric card">
          <span className="muted">Reports this week</span>
          <strong>{weekCount}</strong>
        </article>
        <article className="admin-metric card">
          <span className="muted">Reports this month</span>
          <strong>{monthCount}</strong>
        </article>
        <article className="admin-metric card">
          <span className="muted">Reports in selected {period}</span>
          <strong>{inPeriod.length}</strong>
        </article>
        <article className="admin-metric card">
          <span className="muted">Average reports</span>
          <strong>{averagePerDay.toFixed(1)} <small>/ day</small></strong>
        </article>
      </div>

      <section className="card stack">
        <div className="row-between admin-overview-controls">
          <div>
            <h2>Reports by department</h2>
            <p className="muted small">
              {period === "week" ? "Weeks start on Monday." : "Counts use the report logged date."}
            </p>
          </div>
          <label className="field admin-period-field">
            <span className="field-label">Reporting period</span>
            <select className="select" value={period} onChange={(event) => setPeriod(event.currentTarget.value as DashboardPeriod)}>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </label>
          {period !== "year" ? (
            <label className="field admin-period-field">
              <span className="field-label">Choose a date</span>
              <input
                className="input"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.currentTarget.value || localDateInputValue(new Date()))}
              />
            </label>
          ) : (
            <label className="field admin-period-field">
              <span className="field-label">Calendar year</span>
              <input
                className="input"
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(event) => {
                  const nextYear = Number(event.currentTarget.value);
                  if (Number.isInteger(nextYear) && nextYear >= 2000 && nextYear <= 2100) {
                    setSelectedDate(`${nextYear}-01-01`);
                  }
                }}
              />
            </label>
          )}
        </div>
        <div className="admin-department-counts">
          {departmentCounts.map(({ department, count }) => (
            <article
              className="admin-department-card"
              key={department}
              style={{ borderTopColor: DEPARTMENT_COLOR[department] }}
            >
              <span className="admin-department-dot" style={{ backgroundColor: DEPARTMENT_COLOR[department] }} />
              <span>{DEPARTMENT_LABEL[department]}</span>
              <strong>{count}</strong>
            </article>
          ))}
        </div>
      </section>

      {period === "year" ? (
        <section className="card stack" aria-label={`Report calendar for ${year}`}>
          <div>
            <h2>{year} report calendar</h2>
            <p className="muted small">Select a month to open its daily report calendar.</p>
          </div>
          <div className="admin-year-calendar">
            {Array.from({ length: 12 }, (_, month) => {
              const monthStart = new Date(year, month, 1);
              const monthEnd = new Date(year, month + 1, 1);
              const count = requests.filter((request) => {
                const created = new Date(request.createdAt);
                return created >= monthStart && created < monthEnd;
              }).length;
              return (
                <button
                  className="admin-year-month"
                  key={month}
                  type="button"
                  onClick={() => {
                    setSelectedDate(localDateInputValue(monthStart));
                    setPeriod("month");
                  }}
                >
                  <strong>{monthStart.toLocaleString(undefined, { month: "long" })}</strong>
                  <span>{count} {count === 1 ? "report" : "reports"}</span>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <AdminDailyCalendar
          requests={inPeriod}
          start={bounds.start}
          days={period === "week" ? 7 : bounds.days}
          title={period === "week" ? "Weekly report calendar" : "Monthly report calendar"}
        />
      )}
    </div>
  );
}

function AdminDailyCalendar({
  requests,
  start,
  days,
  title,
}: {
  requests: ServiceRequest[];
  start: Date;
  days: number;
  title: string;
}) {
  const counts = new Map<string, number>();
  requests.forEach((request) => {
    const key = dateKey(new Date(request.createdAt));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  const leadingCells = title.startsWith("Monthly") ? start.getDay() : 0;
  const weekdays = title.startsWith("Monthly")
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    return date;
  });

  return (
    <section className="card stack">
      <h2>{title}</h2>
      <div className="admin-calendar-grid admin-calendar-weekdays" aria-hidden="true">
        {weekdays.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="admin-calendar-grid">
        {Array.from({ length: leadingCells }, (_, index) => <span className="admin-calendar-empty" key={`empty-${index}`} />)}
        {dates.map((date) => {
          const count = counts.get(dateKey(date)) ?? 0;
          return (
            <div className={`admin-calendar-day${count ? " has-reports" : ""}`} key={dateKey(date)}>
              <span><small>{date.toLocaleDateString(undefined, { weekday: "short" })}</small> {date.getDate()}</span>
              {count > 0 && <strong>{count}</strong>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AdminActiveMap({ requests }: { requests: ServiceRequest[] }) {
  const activeReports = requests.filter(isOpen);
  const points = activeReports.map((request) => {
    const department = departmentOf(request);
    return {
      id: request.id,
      lat: request.lat,
      lng: request.lng,
      color: DEPARTMENT_COLOR[department],
      label: `${DEPARTMENT_LABEL[department]} · ${trackingOf(request)}`,
    };
  });
  return (
    <section className="card stack">
      <div>
        <h2>Active report map</h2>
        <p className="muted">Resolved and closed reports are excluded. Marker colors indicate department.</p>
      </div>
      <div className="admin-department-legend">
        {(Object.keys(DEPARTMENT_LABEL) as Department[]).map((department) => (
          <span key={department}>
            <i style={{ backgroundColor: DEPARTMENT_COLOR[department] }} />
            {DEPARTMENT_LABEL[department]}
          </span>
        ))}
      </div>
      <Suspense fallback={<p className="muted">Loading report map…</p>}>
        <FaultMap points={points} height={480} />
      </Suspense>
      <p className="muted small">{activeReports.length} active {activeReports.length === 1 ? "report" : "reports"} shown.</p>
    </section>
  );
}

function TeamAssignmentPanel({
  requests,
  workers,
  teams,
  staff,
  onError,
}: {
  requests: ServiceRequest[];
  workers: FieldWorker[];
  teams: Team[];
  staff: StaffSession;
  onError: (message: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("any");
  const [status, setStatus] = useState("any");
  const filtered = requests.filter((request) => {
    const term = search.trim().toLocaleLowerCase();
    const workerNames = assignedWorkerIdsOf(request)
      .map((id) => workers.find((worker) => worker.id === id)?.name ?? "")
      .join(" ")
      .toLocaleLowerCase();
    const matchesSearch = !term || [
      trackingOf(request),
      CATEGORY_LABEL[request.category],
      request.description,
      workerNames,
    ].some((value) => value.toLocaleLowerCase().includes(term));
    return matchesSearch
      && (department === "any" || departmentOf(request) === department)
      && (status === "any" || request.status === status);
  });

  return (
    <section className="card stack">
      <div>
        <h2>Ticket team assignments</h2>
        <p className="muted">Search and filter tickets, then manage assigned workers and a team leader without changing ticket status.</p>
      </div>
      <div className="admin-ticket-filters">
        <label className="field">
          <span className="field-label">Search tickets</span>
          <input className="input" type="search" value={search} onChange={(event) => setSearch(event.currentTarget.value)} placeholder="Tracking number, issue or worker" />
        </label>
        <label className="field">
          <span className="field-label">Department</span>
          <select className="select" value={department} onChange={(event) => setDepartment(event.currentTarget.value)}>
            <option value="any">All departments</option>
            {(Object.keys(DEPARTMENT_LABEL) as Department[]).map((value) => <option key={value} value={value}>{DEPARTMENT_LABEL[value]}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Status</span>
          <select className="select" value={status} onChange={(event) => setStatus(event.currentTarget.value)}>
            <option value="any">All statuses</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>
      {filtered.length === 0 ? (
        <p className="muted">No tickets match those filters.</p>
      ) : (
        <div className="stack">
          {filtered.map((request) => (
            <TeamAssignmentCard
              key={request.id}
              request={request}
              workers={workers}
              teams={teams}
              staff={staff}
              onError={onError}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function TeamAssignmentCard({
  request,
  workers,
  teams,
  staff,
  onError,
}: {
  request: ServiceRequest;
  workers: FieldWorker[];
  teams: Team[];
  staff: StaffSession;
  onError: (message: string) => void;
}) {
  const department = departmentOf(request);
  const departmentTeams = teams.filter((team) => team.department === department);
  const eligibleIds = new Set(departmentTeams.flatMap((team) => team.workerIds));
  const assigned = assignedWorkerIdsOf(request);
  const eligibleWorkers = workers.filter((worker) => eligibleIds.has(worker.id) || assigned.includes(worker.id));
  const [selected, setSelected] = useState<string[]>(assigned);
  const [leaderId, setLeaderId] = useState(request.teamLeaderId ?? request.assignedTo ?? "");
  const [workerSearch, setWorkerSearch] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setSelected(assignedWorkerIdsOf(request));
    setLeaderId(request.teamLeaderId ?? request.assignedTo ?? "");
  }, [request]);
  const changed = selected.length !== assigned.length
    || selected.some((id) => !assigned.includes(id))
    || leaderId !== (request.teamLeaderId ?? request.assignedTo ?? "");
  const matchingWorkers = eligibleWorkers.filter((worker) =>
    worker.name.toLocaleLowerCase().includes(workerSearch.trim().toLocaleLowerCase()),
  );

  const save = () => {
    onError("");
    setSaving(true);
    try {
      const selectedWorkers = selected
        .map((id) => workers.find((worker) => worker.id === id))
        .filter((worker): worker is FieldWorker => worker !== undefined)
        .map(({ id, name }) => ({ id, name }));
      const updated = requestRepository.assignWorkersTx(
        request.id,
        request.version,
        staff.name,
        selectedWorkers,
        leaderId || undefined,
      );
      setSelected(assignedWorkerIdsOf(updated));
      setLeaderId(updated.teamLeaderId ?? "");
      window.dispatchEvent(new CustomEvent("cc-alert", {
        detail: {
          title: "Team assignment saved",
          body: `${trackingOf(updated)} assignment updated. Ticket status was not changed.`,
        },
      }));
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : "Could not update the team assignment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="admin-assignment-card">
      <div className="row-between">
        <div>
          <h3>{CATEGORY_LABEL[request.category]} · {trackingOf(request)}</h3>
          <p className="muted small">{DEPARTMENT_LABEL[department]} · {STATUS_LABEL[request.status]}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>
      <p className="small">{request.description || "No description provided."}</p>
      {departmentTeams.length === 0 && assigned.length === 0 ? (
        <p className="muted small">Create a team for this department before assigning workers.</p>
      ) : eligibleWorkers.length === 0 ? (
        <p className="muted small">Add field workers to the {DEPARTMENT_LABEL[department]} team before assigning this ticket.</p>
      ) : (
        <>
          <label className="field">
            <span className="field-label">Search department workers</span>
            <input
              className="input"
              type="search"
              value={workerSearch}
              onChange={(event) => setWorkerSearch(event.currentTarget.value)}
              placeholder="Search by worker name"
            />
          </label>
          <fieldset className="team-workers admin-assignee-list">
            <legend className="field-label">Assigned field workers</legend>
            {matchingWorkers.map((worker) => {
              const checked = selected.includes(worker.id);
              return (
                <label className="team-worker-option" key={worker.id}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked ? selected.filter((id) => id !== worker.id) : [...selected, worker.id];
                      setSelected(next);
                      if (!next.includes(leaderId)) setLeaderId(next[0] ?? "");
                    }}
                  />
                  {worker.name}
                </label>
              );
            })}
            {matchingWorkers.length === 0 && <p className="muted small">No department workers match that search.</p>}
          </fieldset>
          {selected.length > 0 && (
            <fieldset className="team-workers admin-assignee-list">
              <legend className="field-label">Team leader</legend>
              {selected.map((id) => {
                const worker = workers.find((candidate) => candidate.id === id);
                if (!worker) return null;
                return (
                  <label className="team-worker-option" key={id}>
                    <input type="radio" name={`leader-${request.id}`} checked={leaderId === id} onChange={() => setLeaderId(id)} />
                    {worker.name}
                  </label>
                );
              })}
            </fieldset>
          )}
        </>
      )}
      <button
        type="button"
        className="btn btn-primary"
        disabled={!changed || saving || (selected.length > 0 && !leaderId)}
        onClick={save}
      >
        {saving ? "Saving assignment…" : "Save team assignment"}
      </button>
    </article>
  );
}

function AdminTickets({
  requests,
  workers,
  teams,
}: {
  requests: ServiceRequest[];
  workers: FieldWorker[];
  teams: Team[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("any");
  const [department, setDepartment] = useState("any");
  const sorted = useMemo(
    () => [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [requests],
  );
  const matching = sorted.filter((request) => {
    const term = search.trim().toLocaleLowerCase();
    const matchesText = !term || [
      trackingOf(request),
      CATEGORY_LABEL[request.category],
      request.description,
      DEPARTMENT_LABEL[departmentOf(request)],
    ].some((value) => value.toLocaleLowerCase().includes(term));
    return matchesText
      && (status === "any" || request.status === status)
      && (department === "any" || departmentOf(request) === department);
  });
  const [selectedId, setSelectedId] = useState<string>();
  const selected = matching.find((request) => request.id === selectedId) ?? matching[0];
  const selectedTeam = selected && teams.find((team) => team.department === departmentOf(selected));

  return (
    <div className="stack">
      <section className="card stack">
        <div>
          <h2>Tickets</h2>
          <p className="muted">Search and filter the ticket register, then select a ticket for its full summary.</p>
        </div>
        <div className="admin-ticket-filters">
          <label className="field">
            <span className="field-label">Search tickets</span>
            <input className="input" type="search" value={search} onChange={(event) => setSearch(event.currentTarget.value)} placeholder="Tracking number, issue or description" />
          </label>
          <label className="field">
            <span className="field-label">Department</span>
            <select className="select" value={department} onChange={(event) => setDepartment(event.currentTarget.value)}>
              <option value="any">All departments</option>
              {(Object.keys(DEPARTMENT_LABEL) as Department[]).map((value) => <option key={value} value={value}>{DEPARTMENT_LABEL[value]}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Status</span>
            <select className="select" value={status} onChange={(event) => setStatus(event.currentTarget.value)}>
              <option value="any">All statuses</option>
              {Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
        <div className="admin-ticket-list" aria-label="Ticket search results">
          {matching.map((request) => (
            <button
              type="button"
              className={`admin-ticket-option${selected?.id === request.id ? " is-selected" : ""}`}
              key={request.id}
              onClick={() => setSelectedId(request.id)}
            >
              <strong>{trackingOf(request)}</strong>
              <span>{CATEGORY_LABEL[request.category]} · {new Date(request.createdAt).toLocaleString()}</span>
              <StatusBadge status={request.status} />
            </button>
          ))}
          {matching.length === 0 && <p className="muted">No tickets match those filters.</p>}
        </div>
      </section>
      {selected && (
        <article className="card stack admin-ticket-detail">
          <div className="row-between">
            <div>
              <p className="muted small">{trackingOf(selected)}</p>
              <h2>{CATEGORY_LABEL[selected.category]}</h2>
            </div>
            <StatusBadge status={selected.status} />
          </div>
          <dl className="admin-ticket-facts">
            <div><dt>Department</dt><dd>{DEPARTMENT_LABEL[departmentOf(selected)]}</dd></div>
            <div><dt>Logged</dt><dd>{new Date(selected.createdAt).toLocaleString()}</dd></div>
            <div><dt>Location</dt><dd>{selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}</dd></div>
            <div><dt>Last updated</dt><dd>{new Date(selected.updatedAt).toLocaleString()}</dd></div>
          </dl>
          <div>
            <h3>Issue summary</h3>
            <p>{selected.description || "No additional description was provided."}</p>
          </div>
          {selected.photo && <img src={selected.photo} alt={`Photo attached to ${trackingOf(selected)}`} className="admin-ticket-photo" />}
          <section className="stack">
            <h3>Assigned team</h3>
            {assignedWorkerIdsOf(selected).length ? (
              <ul className="admin-assigned-names">
                {assignedWorkerIdsOf(selected).map((id) => {
                  const worker = workers.find((candidate) => candidate.id === id);
                  return (
                    <li key={id}>
                      {worker?.name ?? selected.assignedName ?? id}
                      {selected.teamLeaderId === id && <strong> · Team leader</strong>}
                    </li>
                  );
                })}
              </ul>
            ) : <p className="muted">No team members assigned.</p>}
            {selectedTeam && (
              <p className="small">
                Department contact: {selectedTeam.contactEmail
                  ? <a href={`mailto:${selectedTeam.contactEmail}`}>{selectedTeam.contactEmail}</a>
                  : "email not provided"}
                {" · "}
                {selectedTeam.contactPhone
                  ? <a href={`tel:${selectedTeam.contactPhone}`}>{selectedTeam.contactPhone}</a>
                  : <>department phone not provided · General City call centre: <a href={CITY_CALL_CENTRE.href}>{CITY_CALL_CENTRE.label}</a></>}
              </p>
            )}
          </section>
          <details>
            <summary>Ticket history</summary>
            <ul className="mt-2 small">
              {selected.history.map((entry, index) => (
                <li key={`${entry.at}-${index}`}>
                  {new Date(entry.at).toLocaleString()} — {STATUS_LABEL[entry.status]} by {entry.by}
                  {entry.note ? `: ${entry.note}` : ""}
                </li>
              ))}
            </ul>
          </details>
        </article>
      )}
    </div>
  );
}

const blankTeam: TeamInput = {
  name: "",
  description: "",
  department: "roads",
  contactEmail: "",
  contactPhone: "",
  workerIds: [],
};

function TeamManager({
  workers,
  onError,
  onTeamsChange,
}: {
  workers: FieldWorker[];
  onError: (message: string) => void;
  onTeamsChange?: (teams: Team[]) => void;
}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState<TeamInput>(blankTeam);
  const [editingId, setEditingId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workerSearch, setWorkerSearch] = useState("");

  useEffect(() => {
    let active = true;
    void listTeams()
      .then((result) => {
        if (active) {
          setTeams(result);
          onTeamsChange?.(result);
        }
      })
      .catch((reason: unknown) => {
        if (active) onError(reason instanceof Error ? reason.message : "Could not load teams.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [onError, onTeamsChange]);

  const reset = () => {
    setEditingId(undefined);
    setForm(blankTeam);
    setWorkerSearch("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onError("");
    setSaving(true);
    try {
      const saved = await saveTeam(form, editingId);
      const next = [...teams.filter((team) => team.id !== saved.id), saved]
        .sort((a, b) => a.name.localeCompare(b.name));
      setTeams(next);
      onTeamsChange?.(next);
      reset();
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : "Could not save the team.");
    } finally {
      setSaving(false);
    }
  };

  const edit = (team: Team) => {
    setEditingId(team.id);
    setWorkerSearch("");
    setForm({
      name: team.name,
      description: team.description,
      department: team.department,
      contactEmail: team.contactEmail,
      contactPhone: team.contactPhone,
      workerIds: team.workerIds,
    });
  };

  return (
    <section className="card stack" aria-labelledby="team-management-title">
      <div className="row-between">
        <div>
          <h2 id="team-management-title">Team management</h2>
          <p className="muted">Create teams, update their details, and choose their workers.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={reset}>Add team</button>
      </div>
      {loading ? (
        <p className="muted">Loading teams…</p>
      ) : teams.length === 0 ? (
        <p className="muted">No teams yet. Create the first team below.</p>
      ) : (
        <ul className="team-list">
          {teams.map((team) => (
            <li className="team-card" key={team.id}>
              <div className="row-between">
                <div>
                  <h3>{team.name}</h3>
                  <p className="small muted">{DEPARTMENT_LABEL[team.department as Department] ?? team.department}</p>
                </div>
                <div className="row-wrap">
                  <button type="button" className="btn btn-outline" onClick={() => edit(team)}>Edit</button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      if (!window.confirm(`Delete the ${team.name} team? This cannot be undone.`)) return;
                      onError("");
                      void removeTeam(team.id)
                        .then(() => {
                          const next = teams.filter((item) => item.id !== team.id);
                          setTeams(next);
                          onTeamsChange?.(next);
                          if (editingId === team.id) reset();
                        })
                        .catch((reason: unknown) => {
                          onError(reason instanceof Error ? reason.message : "Could not delete the team.");
                        });
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {team.description && <p>{team.description}</p>}
              <p className="small">
                {team.contactEmail && <>Email: <a href={`mailto:${team.contactEmail}`}>{team.contactEmail}</a> </>}
                {team.contactPhone && <>Phone: <a href={`tel:${team.contactPhone}`}>{team.contactPhone}</a></>}
                {!team.contactEmail && !team.contactPhone && <span className="muted">No contact details added.</span>}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form className="team-form" onSubmit={(event) => void submit(event)}>
        <h3>{editingId ? "Edit team" : "Create a team"}</h3>
        <div className="form-grid">
          <label className="field">
            <span className="field-label">Team name</span>
            <input
              className="input"
              required
              maxLength={100}
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.currentTarget.value })}
            />
          </label>
          <label className="field">
            <span className="field-label">Department</span>
            <select
              className="select"
              value={form.department}
              onChange={(event) => setForm({ ...form, department: event.currentTarget.value })}
            >
              {Object.entries(DEPARTMENT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Contact email</span>
            <input
              className="input"
              type="email"
              maxLength={255}
              value={form.contactEmail}
              onChange={(event) => setForm({ ...form, contactEmail: event.currentTarget.value })}
            />
          </label>
          <label className="field">
            <span className="field-label">Contact phone</span>
            <input
              className="input"
              type="tel"
              maxLength={50}
              value={form.contactPhone}
              onChange={(event) => setForm({ ...form, contactPhone: event.currentTarget.value })}
            />
          </label>
        </div>
        <label className="field">
          <span className="field-label">Description</span>
          <textarea
            className="textarea"
            maxLength={1000}
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.currentTarget.value })}
          />
        </label>
        <fieldset className="team-workers">
          <legend className="field-label">Assign field workers to this team</legend>
          <label className="field team-worker-search">
            <span className="field-label">Search field workers</span>
            <input
              className="input"
              type="search"
              placeholder="Search by worker name"
              value={workerSearch}
              onChange={(event) => setWorkerSearch(event.currentTarget.value)}
            />
          </label>
          {form.workerIds.length > 0 && (
            <div className="team-selected-workers" aria-label="Assigned field workers">
              <span className="field-label">Assigned to this team</span>
              <div className="row-wrap">
                {form.workerIds.map((workerId) => {
                  const worker = workers.find((candidate) => candidate.id === workerId);
                  if (!worker) return null;
                  return (
                    <span className="team-worker-chip" key={worker.id}>
                      {worker.name}
                      <button
                        type="button"
                        aria-label={`Remove ${worker.name} from this team`}
                        onClick={() => setForm({
                          ...form,
                          workerIds: form.workerIds.filter((id) => id !== worker.id),
                        })}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          {workers.length === 0 ? (
            <p className="muted small">No field workers available.</p>
          ) : workers.filter((worker) => {
            const search = workerSearch.trim().toLocaleLowerCase();
            return !search || worker.name.toLocaleLowerCase().includes(search);
          }).map((worker) => (
            <label className="team-worker-option" key={worker.id}>
              <input
                type="checkbox"
                checked={form.workerIds.includes(worker.id)}
                onChange={(event) => {
                  const workerIds = event.currentTarget.checked
                    ? [...form.workerIds, worker.id]
                    : form.workerIds.filter((id) => id !== worker.id);
                  setForm({ ...form, workerIds });
                }}
              />
              {worker.name}
            </label>
          ))}
          {workers.length > 0 && !workers.some((worker) =>
            worker.name.toLocaleLowerCase().includes(workerSearch.trim().toLocaleLowerCase()),
          ) && <p className="muted small">No field workers match your search.</p>}
        </fieldset>
        <div className="row-wrap">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Create team"}
          </button>
          {editingId && (
            <button className="btn btn-outline" type="button" onClick={reset}>Cancel edit</button>
          )}
        </div>
      </form>
    </section>
  );
}

function StaffRequest({
  request,
  staff,
  teamName,
  onError,
}: {
  request: ServiceRequest;
  staff: StaffSession;
  teamName?: string;
  onError: (message: string) => void;
}) {
  const run = (action: () => void) => {
    onError("");
    try {
      action();
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : "Could not update this report.");
    }
  };

  const statuses = nextStatuses(request.status, staff.role);

  return (
    <article className="card stack">
      <div className="row-between">
        <h3>{CATEGORY_LABEL[request.category]}</h3>
        <StatusBadge status={request.status} />
      </div>
      <p>{request.description || "No description provided."}</p>
      <p className="muted small">
        {request.trackingNumber ?? request.id} · {new Date(request.createdAt).toLocaleString()}
        {request.assignedName ? ` · Assigned to ${request.assignedName}` : ""}
      </p>
      {request.photo && <img src={request.photo} alt="Report attachment" className="report-thumb" />}
      {staff.role === "field_worker" && teamName && (
        <p className="muted small">
          Marking this report fixed will record {staff.name} and {teamName} Team as the team that resolved it.
        </p>
      )}
      <details>
        <summary>History</summary>
        <ul>
          {request.history.map((entry, index) => (
            <li key={`${entry.at}-${index}`}>
              {new Date(entry.at).toLocaleString()} — {STATUS_LABEL[entry.status]} by {entry.by}
              {entry.note ? `: ${entry.note}` : ""}
            </li>
          ))}
        </ul>
      </details>
      {statuses.filter((status) => status !== "assigned").length > 0 && (
        <div className="row-wrap">
          {statuses.filter((status) => status !== "assigned").map((status) =>
            (
              <button
                key={status}
                className="btn btn-primary"
                onClick={() => run(() => transition(
                  request.id,
                  status,
                  staff,
                  request.version,
                  undefined,
                  staff.role === "field_worker" && status === "resolved" && teamName
                    ? { teamName }
                    : undefined,
                ))}
              >
                Mark {STATUS_LABEL[status].toLowerCase()}
              </button>
            )
          )}
        </div>
      )}
    </article>
  );
}
