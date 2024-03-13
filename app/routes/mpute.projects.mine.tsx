import { getAuth } from "@clerk/remix/ssr.server";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
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
import { TabsContent } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";

const newProjectSchema = z.object({
  intent: z.literal("new"),
  name: z.string(),
  description: z.string(),
  inputFile: z.any(),
});
const newProjectResolver = zodResolver(newProjectSchema);

const deleteProjectSchema = z.object({
  intent: z.literal("delete"),
  projectId: z.string(),
});
const deleteProjectResolver = zodResolver(deleteProjectSchema);

const schema = z.union([newProjectSchema, deleteProjectSchema]);
const resolver = zodResolver(schema);

function NewProject() {
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useRemixForm<z.infer<typeof newProjectSchema>>({
    mode: "onSubmit",
    resolver: newProjectResolver,
    defaultValues: {
      intent: "new",
    },
    submitConfig: {
      method: "POST",
      encType: "multipart/form-data",
    },
    stringifyAllValues: false,
  });

  return (
    <SheetContent className="w-[50vw]">
      <SheetHeader>
        <SheetTitle>New Project</SheetTitle>
        <SheetDescription>Make a new project.</SheetDescription>
      </SheetHeader>
      <Separator className="mt-2 mb-8" />
      <Form
        id="newProject"
        method="post"
        encType="multipart/form-data"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
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

export default function Mine() {
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
              <Button>New Project</Button>
            </SheetTrigger>
            <NewProject />
            {/* TODO list new projects */}
          </Sheet>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export const loader: LoaderFunction = async (args) => {
  const { userId } = await getAuth(args);
  if (!userId)
    return redirect("/mpute/sign-in?redirect_url=" + args.request.url);

  return null;
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
    case "new":
      {
        const file = formData.get("inputFile") as File;
        const text = await file.text();
        await db
          .insertInto("projects")
          .values({
            creator: userId,
            name: data.name,
            description: data.description,
          })
          .executeTakeFirst();
      }
      // TODO update BOINC server
      break;
  }

  return json({ ok: true });
};
