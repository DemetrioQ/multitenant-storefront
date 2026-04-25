import { Button } from "@/components/ui";

type Props = {
  mode: "notfound" | "unavailable";
  message?: string;
  bareHostUrl: string;
};

export function StoreUnavailableScreen({ mode, message, bareHostUrl }: Props) {
  const isNotFound = mode === "notfound";
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center px-6 py-16">
      <div className="max-w-lg text-center">
        <p className="text-xs uppercase tracking-widest text-muted">
          {isNotFound ? "Store not available" : "Temporarily unavailable"}
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
          {isNotFound ? "This store isn't ready yet" : "We can't reach this store right now"}
        </h1>
        <p className="mt-5 text-muted leading-relaxed">
          {isNotFound
            ? "The store at this subdomain either hasn't been set up or has been deactivated. If you're the merchant, sign in to your dashboard to activate it."
            : "The backend is momentarily unreachable. Give it a few seconds and try again — no action needed on your end."}
        </p>
        {!isNotFound && message && <p className="mt-3 text-xs text-muted font-mono">{message}</p>}
        <div className="mt-8 flex justify-center gap-3">
          {!isNotFound && (
            <Button asChild size="pill">
              <a href=".">Retry</a>
            </Button>
          )}
          <Button asChild variant="outline" size="pill">
            <a href={bareHostUrl}>Browse other stores</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
