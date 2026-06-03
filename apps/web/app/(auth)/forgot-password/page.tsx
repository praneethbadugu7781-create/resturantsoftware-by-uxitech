import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form className="w-full max-w-md rounded-lg border bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <input className="mt-5 w-full rounded-md border px-4 py-3" placeholder="Email" />
        <Button className="mt-4 w-full">Send Reset Link</Button>
      </form>
    </main>
  );
}
