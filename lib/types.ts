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
