import type { Metadata } from "next";
import {
  ToolPage,
  generateFamilyStaticParams,
  toolPageMetadata,
} from "@/lib/tools/pages";

const FAMILY = "calculators" as const;

export function generateStaticParams() {
  return generateFamilyStaticParams(FAMILY);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return toolPageMetadata(FAMILY, slug);
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ToolPage family={FAMILY} slug={slug} />;
}
