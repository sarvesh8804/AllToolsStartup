import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPosts, getPost } from "@/lib/blog";
import { createPageMetadata } from "@/lib/seo";
import { blogPath } from "@/lib/urls";
import { InternalLink } from "@/components/ui/InternalLink";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return createPageMetadata({
    title: post.title,
    description: post.description,
    path: blogPath(post.slug),
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-xs text-[var(--muted)]">{post.date}</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        {post.title}
      </h1>
      <p className="mt-4 text-[var(--muted)]">{post.description}</p>
      <div className="prose-forge mt-10 space-y-4 text-[var(--foreground)] [&_a]:text-[var(--copper-bright)] [&_h2]:mt-8 [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-2xl [&_li]:ml-5 [&_li]:list-disc [&_p]:text-[var(--muted)] [&_strong]:text-[var(--foreground)]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
      <p className="mt-12 text-sm text-[var(--muted)]">
        Continue to <InternalLink href="/tools">tools</InternalLink> or{" "}
        <InternalLink href="/">home</InternalLink>.
      </p>
    </article>
  );
}
