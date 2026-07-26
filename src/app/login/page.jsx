import { Suspense } from "react";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata = {
	title: "Sign in",
};

export default function LoginPage() {
	// Auth gating (redirecting signed-in users away from /login, unauthenticated
	// users to /login with ?next=) lives in src/proxy.js on this deployment.
	return (
		<main className="flex min-h-screen items-center justify-center bg-theme-gold-light px-4 dark:bg-black">
			<div className="w-full max-w-sm rounded-2xl border border-theme-gray/15 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-white/[0.03]">
				<div className="flex items-center gap-2 text-lg font-semibold text-theme-blue dark:text-white">
					<span
						className="grid h-8 w-8 place-items-center rounded-lg bg-theme-blue text-white dark:bg-theme-gold dark:text-theme-blue"
						aria-hidden="true"
					>
						C
					</span>
					ConeyRealty Admin
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
