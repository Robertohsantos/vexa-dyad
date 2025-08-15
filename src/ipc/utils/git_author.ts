import { getGithubUser } from "../handlers/github_handlers";

export async function getGitAuthor() {
  const user = await getGithubUser();
  const author = user
    ? {
        name: `[vexa]`,
        email: user.email,
      }
    : {
        name: "[vexa]",
        email: "git@vexa.sh",
      };
  return author;
}
