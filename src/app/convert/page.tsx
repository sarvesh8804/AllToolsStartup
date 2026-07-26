import type { Metadata } from "next";
import {
  FamilyIndexPage,
  familyHubMetadata,
} from "@/lib/tools/pages";

const FAMILY = "convert" as const;

export const metadata: Metadata = familyHubMetadata(FAMILY);

export default function Page() {
  return <FamilyIndexPage family={FAMILY} />;
}
