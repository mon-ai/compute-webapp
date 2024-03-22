import { getAuth } from "@clerk/remix/ssr.server";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionFunction,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { sql } from "kysely";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { z } from "zod";
import { db } from "~/clients/kysely";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
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
import { Textarea } from "~/components/ui/textarea";

const editProjectSchema = z.object({
  intent: z.union([z.literal("new"), z.literal("edit")]),
  projectId: z.string().optional(),
  name: z.string(),
  description: z.string(),
  dockerCommand: z.string(),
  // inputFile: z.any(),
});
const editProjectResolver = zodResolver(editProjectSchema);

const deleteProjectSchema = z.object({
  intent: z.literal("delete"),
  projectId: z.string(),
});

const schema = z.union([editProjectSchema, deleteProjectSchema]);
const resolver = zodResolver(schema);

function EditProject({
  mode,
  name,
  description,
  projectId,
}: {
  mode: "new" | "edit";
  name?: string;
  description?: string;
  projectId?: string;
}) {
  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue,
  } = useRemixForm<z.infer<typeof editProjectSchema>>({
    mode: "onSubmit",
    resolver: editProjectResolver,
    submitConfig: {
      method: "POST",
      // encType: "multipart/form-data",
    },
    defaultValues: {
      intent: mode,
      name,
      description,
      projectId,
    },
    stringifyAllValues: false,
  });

  useEffect(() => {
    setValue("intent", mode);
    setValue("projectId", projectId);
    setValue("name", name ?? "");
    setValue("description", description ?? "");
  }, [mode, projectId, name, description, setValue]);

  return (
    <SheetContent className="w-[50vw]">
      <SheetHeader>
        <SheetTitle>
          {mode == "new" ? "New Project" : "Edit Project"}
        </SheetTitle>
        <SheetDescription>
          {mode == "new" ? "Make a new project." : "Edit project details."}
        </SheetDescription>
      </SheetHeader>
      <Separator className="mb-8 mt-2" />
      <Form
        id="editProject"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <input type="hidden" {...register("intent")} />
        <input type="hidden" {...register("projectId")} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input {...register("name")} />
          {errors.name && (
            <span className="text-destructive text-sm">
              {errors.name.message}
            </span>
          )}
          <span className="text-muted-foreground text-sm">
            A public display name for your project.
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea {...register("description")} />
          {errors.description && (
            <span className="text-destructive text-sm">
              {errors.description.message}
            </span>
          )}
          <span className="text-muted-foreground text-sm">
            A brief description of your project.
          </span>
        </div>
        {/*
        mode == "new" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="inputFile">Input File</Label>
            <Input {...register("inputFile")} type="file" accept=".txt" />
            {errors.inputFile && (
              <span className="text-destructive text-sm">
                {errors.inputFile.message?.toString()}
              </span>
            )}
            <span className="text-muted-foreground text-sm">
              The application input file.
            </span>
          </div>
        )
        */}
        {mode == "new" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="dockerCommand">Command</Label>
            <Input {...register("dockerCommand")} />
            {errors.dockerCommand && (
              <span className="text-destructive text-sm">
                {errors.dockerCommand.message?.toString()}
              </span>
            )}
            <span className="text-muted-foreground text-sm">
              A docker command to run, without `docker run`.
            </span>
          </div>
        )}
      </Form>
      <SheetFooter>
        <SheetClose asChild>
          <Button type="submit" form="editProject">
            Done
          </Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  );
}

type StringSetter = (s: string) => void;

function ActionButtons({
  selected,
  mode,
  setSelected,
  setMode,
  setDefaultName,
  setDefaultDescription,
  project,
}: {
  selected: string;
  mode: "new" | "edit" | "delete";
  setSelected: StringSetter;
  setMode: (s: "new" | "edit" | "delete") => void;
  setDefaultName: StringSetter;
  setDefaultDescription: StringSetter;
  project: {
    id: string;
    name: string;
    description: string;
    active: boolean;
  };
}) {
  const submit = useSubmit();

  // onClick functions
  function submitDelete() {
    submit(
      { intent: "delete", projectId: project.id },
      { method: "post" /*, encType: "multipart/form-data" */ }
    );
  }
  function selectDelete() {
    setMode("delete");
    setSelected(project.id);
  }
  function selectEdit() {
    setMode("edit");
    setSelected(project.id);
    setDefaultName(project.name);
    setDefaultDescription(project.description);
  }

  if (!project.active) {
    return <>Project disabled</>;
  }
  return (
    <div>
      <SheetTrigger asChild>
        <Button onClick={selectEdit} variant="ghost" size="icon">
          <Pencil />
        </Button>
      </SheetTrigger>
      {mode == "delete" && selected === project.id ? (
        <>
          <Button variant="ghost" size="icon" onClick={submitDelete}>
            <Check />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSelected("")}>
            <X />
          </Button>
        </>
      ) : (
        <Button variant="ghost" size="icon" onClick={selectDelete}>
          <Trash2 />
        </Button>
      )}
    </div>
  );
}

export default function Mine() {
  const { projects } = useLoaderData<typeof loader>();

  const [sheetMode, setSheetMode] = useState<"new" | "edit" | "delete">("new");
  const [selected, setSelected] = useState("");
  const [defaultName, setDefaultName] = useState("");
  const [defaultDescription, setDefaultDescription] = useState("");

  function selectNew() {
    setSheetMode("new");
    setSelected("");
    setDefaultName("");
    setDefaultDescription("");
  }

  return (
    <TabsContent value="mine">
      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>Make or edit projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <Sheet>
            <SheetTrigger asChild>
              <Button onClick={selectNew}>New Project</Button>
            </SheetTrigger>
            <EditProject
              mode={sheetMode == "delete" ? "new" : sheetMode}
              projectId={selected}
              name={defaultName}
              description={defaultDescription}
            />
            <Table>
              <TableCaption>My projects.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.description}</TableCell>
                    <TableCell>
                      <ActionButtons
                        project={project}
                        selected={selected}
                        setSelected={setSelected}
                        mode={sheetMode}
                        setMode={setSheetMode}
                        setDefaultName={setDefaultName}
                        setDefaultDescription={setDefaultDescription}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Sheet>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args);
  if (!userId)
    return redirect("/mpute/sign-in?redirect_url=" + args.request.url);

  // fetch all projects by user
  const projects = await db
    .selectFrom("projects")
    .where("creator", "=", userId)
    .selectAll()
    .execute();
  return json({ projects });
};

export const action: ActionFunction = async (args) => {
  const { userId } = await getAuth(args);
  if (!userId)
    return redirect("/mpute/sign-in?redirect_url=" + args.request.url);

  /*
  const formData = await unstable_parseMultipartFormData(
    args.request,
    unstable_createMemoryUploadHandler()
  );
  const { errors, data } = await validateFormData<z.infer<typeof schema>>(
    formData,
    resolver
  );
  */
  const { errors, data } = await getValidatedFormData<z.infer<typeof schema>>(
    args.request,
    resolver
  );
  if (errors) return json({ errors }, { status: 422 });

  switch (data.intent) {
    case "new": {
      /*
      const file = formData.get("inputFile") as File;
      if (!file) return json({ errors: { inputFile: "required" } });
      const text = await file.text();
      */
      const res = await fetch(`${process.env.API_URL}/boinc2docker-app`, {
        method: "POST",
        body: JSON.stringify({
          cmd: data.dockerCommand,
        }),
      });
      console.log(res, await res.text());
      if (res.status != 200) return res;

      await db
        .insertInto("projects")
        .values({
          creator: userId,
          name: data.name,
          description: data.description,
          command: data.dockerCommand,
        })
        .executeTakeFirst();

      return json({ ok: true });
    }
    case "edit": {
      if (!data.projectId) return json({ errors: { projectId: "required" } });
      await db
        .updateTable("projects")
        .where("id", "=", data.projectId)
        .set("name", data.name)
        .set("description", data.description)
        .set("updated_at", sql`now()`)
        .execute();
      return json({ ok: true });
    }
    case "delete": {
      await db
        .updateTable("projects")
        .where("id", "=", data.projectId)
        .set("active", false)
        .set("updated_at", sql`now()`)
        .execute();
      return json({ ok: true });
      // TODO update BOINC server
    }
  }
};
