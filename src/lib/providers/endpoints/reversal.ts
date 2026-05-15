import { http } from "../../api/http";

export interface ReversalByTransactionPayload {
  transactionId: number;
}

export interface ReversalResponse {
  message: string;
  status: string;
  transactionId: number;
}

export async function reversalByTransaction(
  payload: ReversalByTransactionPayload,
) {
  return http<ReversalResponse>("/reversal", {
    method: "PUT",
    body: payload,
  });
}

export async function reversalByPartnerReference(partnerReference: string) {
  return http<ReversalResponse>("/reversal", {
    method: "POST",
    query: {
      partnerReference,
    },
  });
}