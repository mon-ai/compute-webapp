import { SignUp } from "@clerk/remix";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center h-[80vh]">
      <SignUp />
    </div>
  );
}
