import { SITE_URL as BASE, familyPath } from "@/lib/urls";
import { TOOL_FAMILIES } from "@/types/tool";

export const SITE_URL = BASE;

export const TOOL_FAMILIES_PATHS = TOOL_FAMILIES.map((f) => familyPath(f));
