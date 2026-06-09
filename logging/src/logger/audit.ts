import { auditLogger } from "./index.js";

type AuditPayload = {
  action: string;
  actorId: string;
  targetId?: string;
  outcome: "success" | "failure";
};

export function audit(payload: AuditPayload, message: string) {
  auditLogger.info(payload, message);
}
