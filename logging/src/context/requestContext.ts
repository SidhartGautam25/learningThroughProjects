import { AsyncLocalStorage } from "node:async_hooks";

export type RequestContext = {
  requestId: string;
};

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getRequestId(): string | undefined {
  const context = requestContext.getStore();
  return context?.requestId;
}
