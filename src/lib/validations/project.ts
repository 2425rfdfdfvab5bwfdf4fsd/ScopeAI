import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(255),
  clientName: z.string().min(1, "Client name is required").max(255),
  clientEmail: z.string().email("Enter a valid email address"),
  notes: z.string().max(2000).optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  clientName: z.string().min(1).max(255).optional(),
  clientEmail: z.string().email().optional(),
  notes: z.string().max(2000).optional().nullable(),
  status: z.enum(["active", "archived"]).optional(),
});

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
