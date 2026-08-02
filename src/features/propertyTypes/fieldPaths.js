// Dot-path helpers for reading/writing nested locations inside a property's
// custom_fields JSON (e.g. "lot.lot_area_sqm" -> { lot: { lot_area_sqm } }).
// react-hook-form already builds/reads nested objects natively from
// dot-separated field names, so these are only needed for the two spots
// RHF doesn't cover: computing the "everything else" JSON textarea default
// (omitPaths) and safely re-extracting just a type's own fields at submit
// time (pickPaths), ignoring any stale state left over from a property
// type the user briefly selected earlier in the same form session.

function isPlainObject(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pruneEmptyObjects(obj) {
	if (!isPlainObject(obj)) return;
	for (const key of Object.keys(obj)) {
		const value = obj[key];
		if (isPlainObject(value)) {
			pruneEmptyObjects(value);
			if (Object.keys(value).length === 0) delete obj[key];
		} else if (value === undefined || value === "" || (typeof value === "number" && Number.isNaN(value))) {
			delete obj[key];
		}
	}
}

function getAtPath(obj, segments) {
	let current = obj;
	for (const segment of segments) {
		if (!isPlainObject(current)) return undefined;
		current = current[segment];
	}
	return current;
}

function setAtPath(obj, segments, value) {
	let current = obj;
	for (let i = 0; i < segments.length - 1; i += 1) {
		const segment = segments[i];
		if (!isPlainObject(current[segment])) current[segment] = {};
		current = current[segment];
	}
	current[segments[segments.length - 1]] = value;
}

function deleteAtPath(obj, segments) {
	let current = obj;
	for (let i = 0; i < segments.length - 1; i += 1) {
		current = current?.[segments[i]];
		if (!isPlainObject(current)) return;
	}
	delete current[segments[segments.length - 1]];
}

// Returns a deep clone of `obj` with the given dot-paths removed (and any
// now-empty parent objects pruned), for the "additional fields" textarea's
// default value — everything a type's standard fields don't already cover.
export function omitPaths(obj, paths) {
	const clone = JSON.parse(JSON.stringify(obj ?? {}));
	for (const path of paths) deleteAtPath(clone, path.split("."));
	pruneEmptyObjects(clone);
	return clone;
}

// Builds a nested object containing only the given dot-paths' values, read
// out of `obj` — the complement of omitPaths, used to pull just a property
// type's own fields out of the form's tracked (possibly stale) state.
export function pickPaths(obj, paths) {
	const result = {};
	for (const path of paths) {
		const segments = path.split(".");
		const value = getAtPath(obj, segments);
		if (value === undefined || value === "" || (typeof value === "number" && Number.isNaN(value))) continue;
		setAtPath(result, segments, value);
	}
	return result;
}

// Shallow-aware recursive merge of two plain-object JSON trees — `source`
// wins on leaf conflicts. Used to combine the standard fields object back
// into the freeform "additional fields" object before saving.
export function deepMerge(target, source) {
	const result = { ...(target ?? {}) };
	for (const [key, value] of Object.entries(source ?? {})) {
		result[key] = isPlainObject(value) && isPlainObject(result[key]) ? deepMerge(result[key], value) : value;
	}
	return result;
}

// Walks a nested JSON object down to its leaves and returns a flat list of
// { key, value } pairs, dot-path keys (e.g. { links: { fbg: "..." } } ->
// [{ key: "links.fbg", value: "..." }]) — what AdditionalFieldsEditor edits
// as plain rows instead of raw JSON. Leaf values are coerced to strings
// (the editor only writes text back); a bare array leaf is stringified
// rather than dropped, so nothing already saved silently disappears.
export function flattenToPairs(obj) {
	const pairs = [];

	function walk(value, prefix) {
		if (Array.isArray(value)) {
			pairs.push({ key: prefix, value: JSON.stringify(value) });
			return;
		}
		if (isPlainObject(value)) {
			const keys = Object.keys(value);
			if (keys.length === 0) return;
			for (const key of keys) walk(value[key], prefix ? `${prefix}.${key}` : key);
			return;
		}
		if (value === undefined) return;
		pairs.push({ key: prefix, value: String(value) });
	}

	walk(obj ?? {}, "");
	return pairs;
}

// The inverse of flattenToPairs — rebuilds a nested object from a flat list
// of { key, value } rows, skipping blank keys. Every value comes back out
// as a plain string (the editor's rows are always text), matching what it
// wrote in.
export function buildFromPairs(pairs) {
	const result = {};
	for (const { key, value } of pairs ?? []) {
		const trimmedKey = (key ?? "").trim();
		if (!trimmedKey) continue;
		setAtPath(result, trimmedKey.split("."), value ?? "");
	}
	return result;
}
