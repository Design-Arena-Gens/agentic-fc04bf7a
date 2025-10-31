import { serve } from "inngest/next";
import { budgetAlertFn, reminderFn, inngest } from "@/lib/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [budgetAlertFn, reminderFn],
});
