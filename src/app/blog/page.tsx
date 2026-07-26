import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { createPageMetadata } from "@/lib/seo";
import { blogPath } from "@/lib/urls";

export const metadata: Metadata = createPageMetadata({
  title: "Blog",
  description: "Guides and notes from the Forge workshop.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">
        Blog
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        Evergreen notes that link back to real tools.
      </p>
      <ul className="mt-10 space-y-6">
        {posts.map((post) => (
          <li
            key={post.slug}
            className="border-b border-[var(--border)] pb-6"
          >
            <p className="text-xs text-[var(--muted)]">{post.date}</p>
            <Link
              href={blogPath(post.slug)}
              className="mt-1 block font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)] hover:text-[var(--copper-bright)]"
            >
              {post.title}
            </Link>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {post.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
