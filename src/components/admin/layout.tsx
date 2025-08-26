import { Outlet, useLocation } from "react-router-dom";
import AdminSideBar from "./sidebar";
import AdminHeader from "./header";
import { useState } from "react";
import { sidebarMenus } from "./sidebar";

function getRoleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "admin" && sidebarMenus[segments[1]]) {
    return segments[1];
  }
  if (sidebarMenus[segments[0]]) {
    return segments[0];
  }
  return "admin";
}

function AdminLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);
 const location = useLocation();
  const role = getRoleFromPath(location.pathname);
  return (
  <div className="flex min-h-screen w-full dark:bg-gray-900 flex-col md:flex-row">
    {/* Sidebar: Hidden on mobile, visible on md+ */}
    <div className="md:flex">
      <AdminSideBar open={openSidebar} setOpen={setOpenSidebar} role={role} />
    </div>
    <div className="flex flex-1 flex-col">
      <AdminHeader setOpen={setOpenSidebar} />
      <main className="flex-1 flex flex-col bg-muted/40 p-2 sm:p-4 ">
        <Outlet />
      </main>
    </div>
    {/* Mobile Sidebar Overlay */}
    {openSidebar && (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
        <div className="absolute left-0 top-0 w-3/4 max-w-xs bg-white dark:bg-gray-900 h-full shadow-lg">
          <AdminSideBar open={openSidebar} setOpen={setOpenSidebar} role={role} />
        </div>
        {/* Click backdrop to close */}
        <div
          className="absolute inset-0"
          onClick={() => setOpenSidebar(false)}
        />
      </div>
    )}
  </div>
);
}

export default AdminLayout;
