import { Link, Outlet, useLocation } from "@remix-run/react";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function Projects() {
  const location = useLocation();
  const tab = location.pathname.split("/")[3];

  return (
    <div className="flex flex-col justify-center">
      <Tabs defaultValue={tab} className="p-2">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all" asChild>
            <Link to="all">All Projects</Link>
          </TabsTrigger>
          <TabsTrigger value="mine" asChild>
            <Link to="mine">My Projects</Link>
          </TabsTrigger>
        </TabsList>
        <Outlet />
      </Tabs>
    </div>
  );
}
