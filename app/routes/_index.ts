import { LoaderFunction, redirect } from "@remix-run/node";

export const loader: LoaderFunction = () => redirect("/mpute");
