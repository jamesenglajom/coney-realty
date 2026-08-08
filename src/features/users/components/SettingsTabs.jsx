"use client";

import { useState } from "react";

export default function SettingsTabs({ profileSlot, changePasswordSlot, changeEmailSlot, permissionsSlot }) {
	const tabs = [
		{ key: "profile", label: "Profile" },
		{ key: "email", label: "Change email" },
		{ key: "password", label: "Change password" },
		...(permissionsSlot ? [{ key: "permissions", label: "Permissions" }] : []),
	];
	const [activeTab, setActiveTab] = useState(tabs[0].key);

	return (
		<div>
			<div className="mb-6 flex gap-1 border-b border-theme-gold-light dark:border-border-dark">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						type="button"
						onClick={() => setActiveTab(tab.key)}
						className={`px-4 py-2.5 text-sm font-medium transition-colors ${
							activeTab === tab.key
								? "border-b-2 border-theme-blue text-theme-blue dark:border-theme-gold dark:text-theme-gold"
								: "text-txt-muted hover:text-txt-secondary dark:text-txt-muted-dark dark:hover:text-txt-secondary-dark"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{activeTab === "profile" ? profileSlot : null}
			{activeTab === "email" ? changeEmailSlot : null}
			{activeTab === "password" ? changePasswordSlot : null}
			{activeTab === "permissions" ? permissionsSlot : null}
		</div>
	);
}
