export interface CreateOrderParams {
  tourName: string;
  amount: number;
  currency: string;
  customId: string;
}

export interface PaymentOrder {
  id: string;
  status: string;
  approveUrl?: string;
}

export interface PaymentCapture {
  status: string;
  payer?: {
    name?: { given_name?: string; surname?: string };
    email_address?: string;
    payer_id?: string;
  };
  captureId?: string;
  amount?: { currency_code: string; value: string };
}

export interface PaymentOrderDetails {
  id: string;
  status: string;
  custom_id?: string;
  amount?: { currency_code: string; value: string };
}

export interface PaymentRefund {
  id: string;
  status: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  status: "active" | "disabled";
  currencies: string[];
}

export interface PaymentProvider {
  name: string;
  createOrder(params: CreateOrderParams): Promise<PaymentOrder>;
  captureOrder(orderId: string): Promise<PaymentCapture>;
  refundPayment(captureId: string, reason: string): Promise<PaymentRefund>;
  getOrder(orderId: string): Promise<PaymentOrderDetails>;
  getMethods(): PaymentMethod[];
}
