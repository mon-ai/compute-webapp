import { SignedIn, SignedOut } from "@clerk/remix";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "mmon Compute" },
    { name: "description", content: "Public market for compute." },
  ];
};

export default function Landing() {
  return (
    <div>
      <div className="flex flex-row gap-8 mx-auto w-fit">
        <Link to="projects/all">
          <div className="font-['Courier_New'] text-5xl">
            &nbsp;&nbsp;&nbsp;mmon
            <br />
            .co
            <span className="bg-red-400 text-slate-50 shadow-[0.5rem_0.5rem_0_0] shadow-red-900">
              mpute
            </span>
          </div>
        </Link>
        <div className="flex flex-col">
          <SignedIn>
            <Link
              to="projects/all"
              className={cn(buttonVariants({ variant: "link" }), "font-mono")}
            >
              App
            </Link>
          </SignedIn>
          <SignedOut>
            <Link
              to="./sign-in"
              className={cn(buttonVariants({ variant: "link" }), "font-mono")}
            >
              Sign In
            </Link>
            <Link
              to="./sign-up"
              className={cn(buttonVariants({ variant: "link" }), "font-mono")}
            >
              Sign Up
            </Link>
          </SignedOut>
          <Link
            to="./about"
            className={cn(buttonVariants({ variant: "link" }), "font-mono")}
          >
            About
          </Link>
        </div>
      </div>
      <div className="pt-16 flex flex-col gap-4">
        <div className="text-center font-['Courier_New']">
          <h1 className="text-xl">for Researchers</h1>
          <p className="text-2xl font-mono">
            Access cheap compute for research workloads.
          </p>
        </div>
        <div className="text-center font-['Courier_New']">
          <h1 className="text-xl">for Everyone</h1>
          <p className="text-2xl font-mono">
            Donate compute time to advance science.
          </p>
        </div>
      </div>
    </div>
  );
}
