import { STATUS_LABEL, type Status } from "../domain/types";

const STATUS_BADGE_CLASS: Record<Status, string> = {
  submitted: "badge-muted",
  assigned: "badge-accent",
  in_progress: "badge-accent",
  resolved: "badge-primary",
  rejected: "badge-muted",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`badge ${STATUS_BADGE_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}