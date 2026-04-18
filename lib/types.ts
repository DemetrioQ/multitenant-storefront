export type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  sku: string | null;
};

export type ApiProductList = {
  items: ApiProduct[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type ApiStore = {
  name: string;
  slug: string;
  currency: string;
  timezone: string;
  supportEmail: string | null;
  websiteUrl: string | null;
};

export type ApiProblemDetails = {
  title?: string;
  status?: number;
  detail?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly problem?: ApiProblemDetails;
  constructor(status: number, message: string, problem?: ApiProblemDetails) {
    super(message);
    this.status = status;
    this.problem = problem;
  }
}

export type LoginResponse = {
  jwtToken: string;
  expiresAt: string;
};

export type RegisterResponse = {
  customerId: string;
};

export type VerifyEmailResponse = {
  message: string;
};

export type EmailNotVerifiedProblem = ApiProblemDetails & {
  errorCode?: "EMAIL_NOT_VERIFIED";
  canResendAt?: string;
};

export type CustomerClaims = {
  sub: string;
  tenant_id: string;
  sub_type: "customer" | "merchant";
  email: string;
  exp: number;
};

export type CartLineItem = {
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  availableStock: number;
};

export type CartDto = {
  cartId: string;
  items: CartLineItem[];
  subtotal: number;
  totalItems: number;
};

export type AddressDto = {
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  country: string;
};

export type OrderStatus = "pending" | "paid" | "fulfilled" | "canceled" | "refunded";

export type OrderItemDto = {
  productId: string;
  productName: string;
  productSlug: string;
  productSku: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type OrderDto = {
  id: string;
  number: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  shippingAddress: AddressDto;
  billingAddress: AddressDto;
  items: OrderItemDto[];
  createdAt: string;
  paidAt: string | null;
  fulfilledAt: string | null;
  canceledAt: string | null;
};

export type OrderSummaryDto = {
  id: string;
  number: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  createdAt: string;
};

export type OrderListDto = {
  items: OrderSummaryDto[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type CheckoutSessionResponse = {
  orderId: string;
  orderNumber: string;
  provider: "simulation" | "stripe";
  sessionId: string;
  paymentUrl: string;
};

export type StoreSummary = {
  name: string;
  slug: string;
  storeUrl: string;
};

export type StoreSummaryList = {
  items: StoreSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
};
