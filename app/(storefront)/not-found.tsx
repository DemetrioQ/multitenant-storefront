import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-widest text-muted">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-4 text-muted">
        The page you&apos;re looking for doesn&apos;t exist or is no longer available.
      </p>
      <Button asChild size="pill-lg" className="mt-8">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
