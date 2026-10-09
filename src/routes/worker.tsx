import { createFileRoute } from "@tanstack/react-router";
import { StaffDashboard } from "./staff";

export const Route = createFileRoute("/worker")({
  component: () => <StaffDashboard role="field_worker" />,
});
