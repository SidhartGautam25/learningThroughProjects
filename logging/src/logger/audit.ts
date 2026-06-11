import { auditLogger } from "./index.js";

type AuditPayload = {
  action: string;
  actorId: string;
  actorType?: string;
  resourceType: string;
  resourceId?: string;
  outcome: "success" | "failure";
};

export function audit(payload: AuditPayload, message: string) {
  auditLogger.info(
    {
      event: {
        category: "audit",
        action: payload.action,
        outcome: payload.outcome,
      },
      actor: {
        id: payload.actorId,
        type: payload.actorType ?? "user",
      },
      resource: {
        type: payload.resourceType,
        ...(payload.resourceId && { id: payload.resourceId }),
      },
    },
    message,
  );
}
