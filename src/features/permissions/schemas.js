import { z } from "zod";

export const PAGES = ["dashboard", "users", "blogs", "properties", "settings", "leads", "propertyTypes"];
export const EDITABLE_ROLES = ["Admin", "Manager", "Agent"];
export const PERMISSION_ACTIONS = ["view", "create", "edit", "delete"];

const ACTION_TO_COLUMN = {
	view: "can_view",
	create: "can_create",
	edit: "can_edit",
	delete: "can_delete",
};

export function actionColumn(action) {
	return ACTION_TO_COLUMN[action];
}

export const updatePermissionSchema = z.object({
	role: z.enum(EDITABLE_ROLES),
	page: z.enum(PAGES),
	action: z.enum(PERMISSION_ACTIONS),
	value: z.boolean(),
});
