// Tipos de la respuesta de canje (pre-redeem) que usa la factura para mostrar los
// pines. OJO: aquí NO hay ninguna función que llame a `/pin-hype/pre-redeem`: ese
// endpoint se eliminó del backend a propósito. El pin se genera solo server-side
// tras un pago confirmado por webhook; el front nunca canjea directamente.

export interface PreRedeemTransaction {
  transactionId?: string;
  partnerReference?: string;
  key?: string;
  redirectLink?: string;
  [key: string]: unknown;
}

export interface PreRedeemResponse {
  quantity?: number;
  pins?: string[];
  transactions?: PreRedeemTransaction[];
  transaction?: PreRedeemTransaction;
  key?: string;
}
