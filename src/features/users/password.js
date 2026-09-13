import "server-only";
import crypto from "node:crypto";

// New accounts (and password resets) get a random temp password — not a
// deterministic one derived from the email (the old `<local-part>12345`
// scheme meant anyone who knew/guessed a staff email could log in as them).
// Communicated to the user out of band (the create/reset actions surface it
// in the response so the admin can relay it); paired with the
// must_change_password auth.users app_metadata flag (see actions.js) so the
// account is locked to the Account > Change Password tab until they set
// their own. Kept in its own server-only module (not schemas.js) since
// schemas.js is imported by client form components for their Zod resolvers,
// and `node:crypto` can't be bundled into client code.
const TEMP_PASSWORD_CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";

export function generateTempPassword(length = 14) {
	let password = "";
	for (let i = 0; i < length; i += 1) {
		password += TEMP_PASSWORD_CHARSET[crypto.randomInt(TEMP_PASSWORD_CHARSET.length)];
	}
	return password;
}
