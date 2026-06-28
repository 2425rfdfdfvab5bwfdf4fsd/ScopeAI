// Type declarations for modules with missing or broken bundled types
declare module "@hookform/resolvers/zod" {
  import type { Resolver } from "react-hook-form";
  import type { ZodType, ZodTypeDef } from "zod";

  export function zodResolver<
    TFieldValues extends Record<string, unknown>,
    TContext = unknown,
  >(
    schema: ZodType<TFieldValues, ZodTypeDef, unknown>,
    schemaOptions?: unknown,
    factoryOptions?: { mode?: "async" | "sync"; raw?: boolean }
  ): Resolver<TFieldValues, TContext>;
}
