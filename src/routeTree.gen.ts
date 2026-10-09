/* eslint-disable */
// Hand-maintained route tree. If you add a route, mirror it here.
import { Route as rootRouteImport } from "./routes/__root";
import { Route as IndexRouteImport } from "./routes/index";
import { Route as LoginRouteImport } from "./routes/login";
import { Route as ReportRouteImport } from "./routes/report";
import { Route as ReportsRouteImport } from "./routes/reports";
import { Route as StaffRouteImport } from "./routes/staff";
import { Route as TrackRouteImport } from "./routes/track";
import { Route as AdminRouteImport } from "./routes/admin";
import { Route as WorkerRouteImport } from "./routes/worker";

const IndexRoute = IndexRouteImport.update({
  id: "/", path: "/", getParentRoute: () => rootRouteImport,
} as any);
const LoginRoute = LoginRouteImport.update({
  id: "/login", path: "/login", getParentRoute: () => rootRouteImport,
} as any);
const ReportRoute = ReportRouteImport.update({
  id: "/report", path: "/report", getParentRoute: () => rootRouteImport,
} as any);
const ReportsRoute = ReportsRouteImport.update({
  id: "/reports", path: "/reports", getParentRoute: () => rootRouteImport,
} as any);
const StaffRoute = StaffRouteImport.update({
  id: "/staff", path: "/staff", getParentRoute: () => rootRouteImport,
} as any);
const TrackRoute = TrackRouteImport.update({
  id: "/track", path: "/track", getParentRoute: () => rootRouteImport,
} as any);
const AdminRoute = AdminRouteImport.update({
  id: "/admin", path: "/admin", getParentRoute: () => rootRouteImport,
} as any);
const WorkerRoute = WorkerRouteImport.update({
  id: "/worker", path: "/worker", getParentRoute: () => rootRouteImport,
} as any);

export interface FileRoutesByFullPath {
  "/": typeof IndexRoute;
  "/login": typeof LoginRoute;
  "/report": typeof ReportRoute;
  "/reports": typeof ReportsRoute;
  "/staff": typeof StaffRoute;
  "/track": typeof TrackRoute;
  "/admin": typeof AdminRoute;
  "/worker": typeof WorkerRoute;
}
export interface FileRoutesByTo extends FileRoutesByFullPath {}
export interface FileRoutesById {
  __root__: typeof rootRouteImport;
  "/": typeof IndexRoute;
  "/login": typeof LoginRoute;
  "/report": typeof ReportRoute;
  "/reports": typeof ReportsRoute;
  "/staff": typeof StaffRoute;
  "/track": typeof TrackRoute;
  "/admin": typeof AdminRoute;
  "/worker": typeof WorkerRoute;
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths: keyof FileRoutesByFullPath;
  to: keyof FileRoutesByTo;
  id: keyof FileRoutesById;
  fileRoutesByTo: FileRoutesByTo;
  fileRoutesById: FileRoutesById;
}

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      id: "/";
      path: "/";
      fullPath: "/";
      preLoaderRoute: typeof IndexRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/login": {
      id: "/login";
      path: "/login";
      fullPath: "/login";
      preLoaderRoute: typeof LoginRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/report": {
      id: "/report";
      path: "/report";
      fullPath: "/report";
      preLoaderRoute: typeof ReportRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/reports": {
      id: "/reports";
      path: "/reports";
      fullPath: "/reports";
      preLoaderRoute: typeof ReportsRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/staff": {
      id: "/staff";
      path: "/staff";
      fullPath: "/staff";
      preLoaderRoute: typeof StaffRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/track": {
      id: "/track";
      path: "/track";
      fullPath: "/track";
      preLoaderRoute: typeof TrackRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/admin": {
      id: "/admin";
      path: "/admin";
      fullPath: "/admin";
      preLoaderRoute: typeof AdminRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/worker": {
      id: "/worker";
      path: "/worker";
      fullPath: "/worker";
      preLoaderRoute: typeof WorkerRouteImport;
      parentRoute: typeof rootRouteImport;
    };
  }
}

const rootRouteChildren = {
  IndexRoute, LoginRoute, ReportRoute, ReportsRoute, StaffRoute, TrackRoute, AdminRoute, WorkerRoute,
};
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();