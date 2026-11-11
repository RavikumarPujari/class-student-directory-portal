import { useState } from "react";
import { Outlet } from "react-router-dom";
import { PortalSidebar } from "./PortalSidebar";
import { PortalHeader } from "./PortalHeader";
import { PortalFooter } from "./PortalFooter";

export function PortalLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f3f6fb] text-slate-800">
      {/* Sidebar (Desktop Persistent + Mobile Drawer) */}
      <PortalSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area (Offset by sidebar width on lg) */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        {/* Top Header */}
        <PortalHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>

        {/* Bottom Footer */}
        <PortalFooter />
      </div>
    </div>
  );
}
