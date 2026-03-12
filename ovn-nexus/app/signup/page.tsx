// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/db/supabase-client";
import { useRouter } from "next/navigation";
import { CheckCircle2, Mail } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("researcher");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // When email confirmation is enabled, Supabase returns user with empty identities
    const needsConfirmation =
      data.user && (!data.user.identities || data.user.identities.length === 0)
      || (data.user && !data.session);

    if (needsConfirmation) {
      setConfirmationSent(true);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/");
  }

  // Show confirmation screen after successful signup
  if (confirmationSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-7 w-7 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription className="mt-2 text-base">
              We sent a confirmation link to
            </CardDescription>
            <p className="mt-1 font-medium text-foreground">{email}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground space-y-2">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                Click the link in the email to verify your account
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                Then return here to sign in
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                Check your spam folder if you don&apos;t see it within a few minutes
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full" onClick={() => { setConfirmationSent(false); setEmail(""); setPassword(""); setFullName(""); }}>
                Use a different email
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already confirmed?{" "}
                <Link href="/login" className="text-primary hover:underline">Sign in</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            OVN
          </div>
          <CardTitle className="text-2xl">Join OVN Nexus</CardTitle>
          <CardDescription>Create your account to join the research network</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="fullName">Full Name</label>
              <Input id="fullName" placeholder="Dr. Jane Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input id="email" type="email" placeholder="researcher@institution.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinic">Clinic / Dentist</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="pi">Principal Investigator</SelectItem>
                  <SelectItem value="analyst">Data Analyst</SelectItem>
                  <SelectItem value="observer">Observer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
