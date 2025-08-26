import { Outlet } from "react-router-dom";

import AdminHeader from "./header";
import { useState } from "react";

function AdminLayoutdefault() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex min-h-screen w-full dark:bg-gray-900">
      <div className="flex flex-1 flex-col">
        <AdminHeader setOpen={setOpenSidebar} />
        <main className="flex flex-col bg-muted/40 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayoutdefault;
