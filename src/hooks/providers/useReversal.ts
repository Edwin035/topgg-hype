import { useMutation } from "@tanstack/react-query";
import {
  reversalByTransaction,
  reversalByPartnerReference,
  ReversalByTransactionPayload,
} from "@/lib/providers/endpoints/reversal";

/* =========================
   HOOKS
========================= */

// Reversal por transactionId
export function useReversalByTransaction() {
  return useMutation({
    mutationFn: (payload: ReversalByTransactionPayload) =>
      reversalByTransaction(payload),
  });
}

// Reversal por partnerReference
export function useReversalByPartnerReference() {
  return useMutation({
    mutationFn: (partnerReference: string) =>
      reversalByPartnerReference(partnerReference),
  });
}
