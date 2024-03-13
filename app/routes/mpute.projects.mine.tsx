import { getAuth } from "@clerk/remix/ssr.server";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionFunction,
  LoaderFunctionArgs,
  json,
  redirect,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { sql } from "kysely";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRemixForm, validateFormData } from "remix-hook-form";
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

const newProjectSchema = z.object({
  intent: z.union([z.literal("new"), z.literal("edit")]),
  projectId: z.string().optional(),
  name: z.string(),
  description: z.string(),
  inputFile: z.any(),
});
const newProjectResolver = zodResolver(newProjectSchema);

const deleteProjectSchema = z.object({
  intent: z.literal("delete"),
  projectId: z.string(),
});

const schema = z.union([newProjectSchema, deleteProjectSchema]);
const resolver = zodResolver(schema);

function NewProject({
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
  } = useRemixForm<z.infer<typeof newProjectSchema>>({
    mode: "onSubmit",
    resolver: newProjectResolver,
    submitConfig: {
      method: "POST",
      encType: "multipart/form-data",
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
      <Separator className="mt-2 mb-8" />
      <Form
        id="newProject"
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
        {mode == "new" && (
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
        )}
      </Form>
      <SheetFooter>
        <SheetClose asChild>
          <Button type="submit" form="newProject">
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
  if (!project.active) {
    return <>Project disabled</>;
  }

  return (
    <div>
      <SheetTrigger asChild>
        <Button
          onClick={() => {
            setMode("edit");
            setSelected(project.id);
            setDefaultName(project.name);
            setDefaultDescription(project.description);
          }}
          variant="ghost"
          size="icon"
        >
          <Pencil />
        </Button>
      </SheetTrigger>
      {mode == "delete" && selected === project.id ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              submit(
                { intent: "delete", projectId: project.id },
                { method: "post", encType: "multipart/form-data" }
              )
            }
          >
            <Check />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setSelected("")}>
            <X />
          </Button>
        </>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setMode("delete");
            setSelected(project.id);
          }}
        >
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
              <Button
                onClick={() => {
                  setSheetMode("new");
                  setSelected("");
                  setDefaultName("");
                  setDefaultDescription("");
                }}
              >
                New Project
              </Button>
            </SheetTrigger>
            <NewProject
              mode={sheetMode !== "delete" ? sheetMode : "edit"}
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
                        selected={selected}
                        setSelected={setSelected}
                        setMode={setSheetMode}
                        project={project}
                        mode={sheetMode}
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

  // fetch all projects
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

  const formData = await unstable_parseMultipartFormData(
    args.request,
    unstable_createMemoryUploadHandler()
  );
  const { errors, data } = await validateFormData<z.infer<typeof schema>>(
    formData,
    resolver
  );
  if (errors) return json({ errors }, { status: 422 });

  switch (data.intent) {
    case "new": {
      const file = formData.get("inputFile") as File;
      if (!file) return json({ errors: { inputFile: "required" } });
      await db
        .insertInto("projects")
        .values({
          creator: userId,
          name: data.name,
          description: data.description,
        })
        .executeTakeFirst();

      return json({ ok: true });
      // TODO update BOINC server
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
