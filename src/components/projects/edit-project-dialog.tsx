"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UpdateProjectSchema, type UpdateProjectInput } from "@/lib/validations/project";

interface EditProjectDialogProps {
  project: {
    id: string;
    name: string;
    clientName: string;
    clientEmail: string;
    notes?: string | null;
  };
}

export function EditProjectDialog({ project }: EditProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProjectInput>({
    resolver: zodResolver(UpdateProjectSchema),
    defaultValues: {
      name: project.name,
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      notes: project.notes ?? "",
    },
  });

  async function onSubmit(data: UpdateProjectInput) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to update project.");
        return;
      }
      toast.success("Project updated.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="w-4 h-4 mr-1.5" />
          Edit Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Project name</Label>
            <Input id="edit-name" {...register("name")} aria-invalid={!!errors.name} />
            {errors.name && (
              <p className="text-xs text-rose-600">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-clientName">Client name</Label>
            <Input id="edit-clientName" {...register("clientName")} aria-invalid={!!errors.clientName} />
            {errors.clientName && (
              <p className="text-xs text-rose-600">{errors.clientName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-clientEmail">Client email</Label>
            <Input id="edit-clientEmail" type="email" {...register("clientEmail")} aria-invalid={!!errors.clientEmail} />
            {errors.clientEmail && (
              <p className="text-xs text-rose-600">{errors.clientEmail.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">
              Notes <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Textarea id="edit-notes" rows={2} {...register("notes")} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" loading={isLoading} className="flex-1">
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
