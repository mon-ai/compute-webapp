import { UserButton } from "@clerk/remix";
import { Link, Outlet } from "@remix-run/react";

export default function Layout() {
  return (
    <div>
      <div className="flex justify-between items-center sticky top-0 p-2">
        <Link to="/mpute">
          <div className="font-['Courier_New'] text-xl leading-none">
            &nbsp;&nbsp;&nbsp;mmon
            <br />
            .co
            <span className="bg-red-400 text-slate-50 shadow-[0.25rem_0.25rem_0_0] shadow-red-900">
              mpute
            </span>
          </div>
        </Link>
        <nav>
          <UserButton />
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
