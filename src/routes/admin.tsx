import { createFileRoute } from "@tanstack/react-router";
import { StaffDashboard } from "./staff";

export const Route = createFileRoute("/admin")({
  component: () => <StaffDashboard role="admin" />,
});
