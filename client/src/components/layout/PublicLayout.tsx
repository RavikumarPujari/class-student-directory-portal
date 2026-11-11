import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f3f6fb] text-slate-800">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
export default PublicLayout;
