"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateProjectSchema, type CreateProjectInput } from "@/lib/validations/project";

export default function NewProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(CreateProjectSchema),
  });

  async function onSubmit(data: CreateProjectInput) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Failed to create project.");
        return;
      }

      toast.success("Project created successfully.");
      router.push(`/projects/${json.project.id}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create a new project</CardTitle>
          <CardDescription>
            Add your client&apos;s details. You&apos;ll define the project scope in the next step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Project name</Label>
              <Input
                id="name"
                placeholder="e.g. Acme Corp Website Redesign"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-xs text-rose-600" role="alert">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="clientName">Client name</Label>
              <Input
                id="clientName"
                placeholder="e.g. John Smith"
                {...register("clientName")}
                aria-invalid={!!errors.clientName}
              />
              {errors.clientName && (
                <p className="text-xs text-rose-600" role="alert">{errors.clientName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="clientEmail">Client email</Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="e.g. john@acme.com"
                {...register("clientEmail")}
                aria-invalid={!!errors.clientEmail}
              />
              {errors.clientEmail && (
                <p className="text-xs text-rose-600" role="alert">{errors.clientEmail.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">
                Notes <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Internal notes about this project — not used for scope analysis."
                rows={3}
                {...register("notes")}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" loading={isLoading} className="flex-1">
                Create Project
              </Button>
              <Link href="/projects">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
