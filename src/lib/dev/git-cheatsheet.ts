export type GitCheatEntry = {
  command: string;
  name: string;
  description: string;
  example?: string;
};

export type GitCheatCategory = {
  id: string;
  title: string;
  entries: GitCheatEntry[];
};

export const GIT_CHEATSHEET: GitCheatCategory[] = [
  {
    id: "setup",
    title: "Setup",
    entries: [
      {
        command: "git config --global user.name \"Name\"",
        name: "Set user name",
        description: "Configure the author name for commits on this machine.",
      },
      {
        command: "git config --global user.email \"you@example.com\"",
        name: "Set user email",
        description: "Configure the author email for commits.",
      },
      {
        command: "git init",
        name: "Initialize repo",
        description: "Create a new Git repository in the current directory.",
        example: "git init my-project",
      },
      {
        command: "git clone <url>",
        name: "Clone",
        description: "Copy a remote repository to your machine.",
      },
    ],
  },
  {
    id: "stage-commit",
    title: "Stage & commit",
    entries: [
      {
        command: "git status",
        name: "Status",
        description: "Show changed, staged, and untracked files.",
      },
      {
        command: "git add <file>",
        name: "Stage file",
        description: "Add a file to the index for the next commit.",
        example: "git add README.md",
      },
      {
        command: "git add .",
        name: "Stage all",
        description: "Stage all changes in the working tree (use carefully).",
      },
      {
        command: "git commit -m \"message\"",
        name: "Commit",
        description: "Record staged changes with a message.",
      },
      {
        command: "git commit --amend",
        name: "Amend",
        description: "Rewrite the latest commit (message and/or staged changes).",
      },
      {
        command: "git restore --staged <file>",
        name: "Unstage",
        description: "Remove a file from the index, keep working tree changes.",
      },
    ],
  },
  {
    id: "branch",
    title: "Branch & checkout",
    entries: [
      {
        command: "git branch",
        name: "List branches",
        description: "Show local branches; current branch is marked with *.",
      },
      {
        command: "git branch <name>",
        name: "Create branch",
        description: "Create a new branch at the current HEAD.",
      },
      {
        command: "git switch <name>",
        name: "Switch branch",
        description: "Move HEAD to another branch (modern alternative to checkout).",
      },
      {
        command: "git switch -c <name>",
        name: "Create & switch",
        description: "Create a new branch and switch to it.",
      },
      {
        command: "git branch -d <name>",
        name: "Delete branch",
        description: "Delete a merged local branch.",
      },
    ],
  },
  {
    id: "remote",
    title: "Remote sync",
    entries: [
      {
        command: "git remote -v",
        name: "List remotes",
        description: "Show remote names and URLs.",
      },
      {
        command: "git fetch",
        name: "Fetch",
        description: "Download remote changes without merging.",
      },
      {
        command: "git pull",
        name: "Pull",
        description: "Fetch and integrate remote changes into the current branch.",
      },
      {
        command: "git push",
        name: "Push",
        description: "Upload local commits to the tracked remote branch.",
      },
      {
        command: "git push -u origin <branch>",
        name: "Push new branch",
        description: "Publish a branch and set upstream tracking.",
      },
    ],
  },
  {
    id: "history",
    title: "History & diff",
    entries: [
      {
        command: "git log --oneline",
        name: "Compact log",
        description: "Show commit history one line per commit.",
      },
      {
        command: "git log --graph --oneline --all",
        name: "Graph log",
        description: "ASCII graph of branches and commits.",
      },
      {
        command: "git diff",
        name: "Diff unstaged",
        description: "Show unstaged changes in the working tree.",
      },
      {
        command: "git diff --staged",
        name: "Diff staged",
        description: "Show changes that are staged for commit.",
      },
      {
        command: "git show <commit>",
        name: "Show commit",
        description: "Display a commit’s metadata and patch.",
      },
    ],
  },
  {
    id: "undo",
    title: "Undo & cleanup",
    entries: [
      {
        command: "git restore <file>",
        name: "Discard changes",
        description: "Revert a file in the working tree to HEAD (destructive).",
      },
      {
        command: "git reset --soft HEAD~1",
        name: "Undo commit (keep staged)",
        description: "Remove the last commit but keep changes staged.",
      },
      {
        command: "git reset --mixed HEAD~1",
        name: "Undo commit (unstaged)",
        description: "Remove the last commit; changes stay in the working tree.",
      },
      {
        command: "git stash",
        name: "Stash",
        description: "Temporarily shelf local changes.",
      },
      {
        command: "git stash pop",
        name: "Stash pop",
        description: "Apply the latest stash and drop it from the stash list.",
      },
      {
        command: "git clean -fd",
        name: "Clean untracked",
        description: "Remove untracked files and directories (destructive).",
      },
    ],
  },
  {
    id: "merge-rebase",
    title: "Merge & rebase",
    entries: [
      {
        command: "git merge <branch>",
        name: "Merge",
        description: "Join another branch into the current branch.",
      },
      {
        command: "git rebase <branch>",
        name: "Rebase",
        description: "Replay commits on top of another base.",
      },
      {
        command: "git rebase -i HEAD~3",
        name: "Interactive rebase",
        description: "Edit, squash, or reorder recent commits.",
      },
      {
        command: "git cherry-pick <commit>",
        name: "Cherry-pick",
        description: "Apply a single commit onto the current branch.",
      },
    ],
  },
];

export function filterGitCheatsheet(
  query: string,
  categories: GitCheatCategory[] = GIT_CHEATSHEET,
): GitCheatCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return categories;
  return categories
    .map((cat) => ({
      ...cat,
      entries: cat.entries.filter((e) => {
        const hay = [e.command, e.name, e.description, e.example ?? ""]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      }),
    }))
    .filter((cat) => cat.entries.length > 0);
}

export function countGitCheatsheetEntries(
  categories: GitCheatCategory[],
): number {
  return categories.reduce((n, c) => n + c.entries.length, 0);
}
