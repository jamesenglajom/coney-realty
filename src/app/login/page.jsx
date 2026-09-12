import { Suspense } from "react";
import Image from "next/image";
import LoginForm from "@/features/auth/components/LoginForm";
import { getBrandSettings } from "@/features/brand/queries";

export const metadata = {
	title: "Sign in",
};

export default async function LoginPage() {
	// Auth gating (redirecting signed-in users away from /login, unauthenticated
	// users to /login with ?next=) lives in src/proxy.js on this deployment.
	const brand = await getBrandSettings();

	return (
		<main className="flex min-h-screen items-center justify-center bg-theme-gold-light px-4 dark:bg-bg-dark">
			<div className="w-full max-w-sm rounded-2xl border border-theme-gray/15 bg-white p-8 shadow-xl dark:border-border-dark dark:bg-surface-dark">
				<div className="flex items-center gap-2 text-lg font-semibold text-theme-blue dark:text-white">
					<Image
						src={brand.logoUrl}
						alt={brand.siteName}
						width={32}
						height={32}
						unoptimized
						className="rounded-lg object-contain"
					/>
					{brand.siteName} Admin
				</div>
				<p className="mt-4 text-sm text-txt-muted dark:text-txt-muted-dark">
					Sign in with the credentials your admin gave you.
				</p>
				<Suspense>
					<LoginForm />
				</Suspense>
			</div>
		</main>
	);
}
