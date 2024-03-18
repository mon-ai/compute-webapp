import { SignedIn, SignedOut } from "@clerk/remix";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "mmon Compute" },
    { name: "description", content: "Public market for compute." },
  ];
};

export default function Landing() {
  return (
    <div>
      <div className="flex">
        <div className="font-mono text-8xl">
          <br />
          .co
        </div>
        <div className="flex flex-col">
          <div className="grid grid-cols-2 gap-x-16 gap-y-8">
            <Link to="projects/all">
              <div className="font-mono text-8xl">
                mmon
                <br />
                <span className="bg-red-400 text-slate-50 shadow-[0.5rem_0.5rem_0_0] shadow-red-900">
                  mpute
                </span>
              </div>
            </Link>
            <div className="font-mono text-2xl pt-6">
              <SignedIn>
                <Link to="projects" className="hover:underline">
                  App
                </Link>
              </SignedIn>
              <SignedOut>
                <Link to="sign-in" className="hover:underline">
                  Sign In
                </Link>
                <br />
                <Link to="sign-up" className="hover:underline">
                  Sign Up
                </Link>
              </SignedOut>
              <br />
              <Link to="about" className="hover:underline">
                About
              </Link>
            </div>
            <div className="font-mono text-2xl col-span-2">
              is a public market for computation.
            </div>
          </div>
          <div className="pt-16 grid grid-cols-2 gap-y-4">
            <div className="font-mono text-2xl col-span-2">
              <h1 className="">for Researchers</h1>
              <p className="font-bold">
                Access cheap compute for research workloads.
              </p>
            </div>
            <div className="font-mono text-2xl col-span-2">
              <h1 className="">for Everyone</h1>
              <p className="font-bold">
                Donate compute time to advance science.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
