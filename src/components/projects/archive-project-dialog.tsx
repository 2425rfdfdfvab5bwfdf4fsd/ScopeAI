"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ArchiveProjectDialogProps {
  project: { id: string; name: string; status: string };
}

export function ArchiveProjectDialog({ project }: ArchiveProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isArchived = project.status === "archived";

  async function handleAction() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isArchived ? "active" : "archived" }),
      });
      if (!res.ok) {
        toast.error("Failed to update project.");
        return;
      }
      toast.success(isArchived ? "Project restored." : "Project archived.");
      setOpen(false);
      router.refresh();
      if (!isArchived) router.push("/projects");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={isArchived ? "" : "text-slate-600"}>
          {isArchived ? (
            <><ArchiveRestore className="w-4 h-4 mr-1.5" />Restore</>
          ) : (
            <><Archive className="w-4 h-4 mr-1.5" />Archive</>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isArchived ? "Restore project?" : "Archive project?"}</DialogTitle>
          <DialogDescription>
            {isArchived
              ? `This will restore "${project.name}" and resume monitoring.`
              : `This will archive "${project.name}". Monitoring will stop, but all data is preserved.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={isArchived ? "default" : "outline"}
            onClick={handleAction}
            loading={isLoading}
            className={!isArchived ? "border-slate-300 text-slate-700 hover:bg-slate-100" : ""}
          >
            {isArchived ? "Restore Project" : "Archive Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
