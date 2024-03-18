import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/clients/kysely";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { TabsContent } from "~/components/ui/tabs";

export default function All() {
  const { projects } = useLoaderData<typeof loader>();

  return (
    <TabsContent value="all">
      <Button variant="link" asChild>
        <a href="https://boinc.mmon.co/proto" target="_blank" rel="noreferrer">
          Get BOINC client
        </a>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>Contribute to existing projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>All projects.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>{project.creator}</TableCell>
                  <TableCell>{project.active ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export const loader = async () => {
  // fetch all projects
  const projects = await db.selectFrom("projects").selectAll().execute();
  return json({ projects });
};
