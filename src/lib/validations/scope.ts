import { z } from "zod";

export const UpdateScopeSchema = z.object({
  contentText: z
    .string()
    .min(10, "Scope must be at least 10 characters")
    .max(50000, "Scope cannot exceed 50,000 characters"),
  sourceType: z.enum(["manual", "pdf_upload", "docx_upload"]).default("manual"),
  fileName: z.string().max(500).optional().nullable(),
  fileSizeBytes: z.number().int().positive().optional().nullable(),
});

export type UpdateScopeInput = z.infer<typeof UpdateScopeSchema>;

export const UpdateNotificationPrefsSchema = z.object({
  emailNewAlert: z.boolean().optional(),
  emailDailyDigest: z.boolean().optional(),
  emailDigestHourUtc: z.number().int().min(0).max(23).optional(),
  emailCoApproved: z.boolean().optional(),
  emailCoRejected: z.boolean().optional(),
  emailCoExpired: z.boolean().optional(),
  emailIntegrationDisconnect: z.boolean().optional(),
  emailPaymentFailed: z.boolean().optional(),
  inAppNewAlert: z.boolean().optional(),
  inAppCoStatusChange: z.boolean().optional(),
});

export type UpdateNotificationPrefsInput = z.infer<typeof UpdateNotificationPrefsSchema>;
