import { type PaymentProvider } from "./types";
import { PayPalProvider } from "./paypal";

let provider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (!provider) {
    provider = new PayPalProvider();
  }
  return provider;
}
