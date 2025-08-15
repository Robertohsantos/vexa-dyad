import { normalizePath } from "../../../shared/normalizePath";
import log from "electron-log";
import { SqlQuery } from "../../lib/schemas";

const logger = log.scope("vexa_tag_parser");

export function getVexaWriteTags(fullResponse: string): {
  path: string;
  content: string;
  description?: string;
}[] {
  const vexaWriteRegex = /<vexa-write([^>]*)>([\s\S]*?)<\/vexa-write>/gi;
  const pathRegex = /path="([^"]+)"/;
  const descriptionRegex = /description="([^"]+)"/;

  let match;
  const tags: { path: string; content: string; description?: string }[] = [];

  while ((match = vexaWriteRegex.exec(fullResponse)) !== null) {
    const attributesString = match[1];
    let content = match[2].trim();

    const pathMatch = pathRegex.exec(attributesString);
    const descriptionMatch = descriptionRegex.exec(attributesString);

    if (pathMatch && pathMatch[1]) {
      const path = pathMatch[1];
      const description = descriptionMatch?.[1];

      const contentLines = content.split("\n");
      if (contentLines[0]?.startsWith("```")) {
        contentLines.shift();
      }
      if (contentLines[contentLines.length - 1]?.startsWith("```")) {
        contentLines.pop();
      }
      content = contentLines.join("\n");

      tags.push({ path: normalizePath(path), content, description });
    } else {
      logger.warn(
        "Found <vexa-write> tag without a valid 'path' attribute:",
        match[0],
      );
    }
  }
  return tags;
}

export function getVexaRenameTags(fullResponse: string): {
  from: string;
  to: string;
}[] {
  const vexaRenameRegex =
    /<vexa-rename from="([^"]+)" to="([^"]+)"[^>]*>([\s\S]*?)<\/vexa-rename>/g;
  let match;
  const tags: { from: string; to: string }[] = [];
  while ((match = vexaRenameRegex.exec(fullResponse)) !== null) {
    tags.push({
      from: normalizePath(match[1]),
      to: normalizePath(match[2]),
    });
  }
  return tags;
}

export function getVexaDeleteTags(fullResponse: string): string[] {
  const vexaDeleteRegex =
    /<vexa-delete path="([^"]+)"[^>]*>([\s\S]*?)<\/vexa-delete>/g;
  let match;
  const paths: string[] = [];
  while ((match = vexaDeleteRegex.exec(fullResponse)) !== null) {
    paths.push(normalizePath(match[1]));
  }
  return paths;
}

export function getVexaAddDependencyTags(fullResponse: string): string[] {
  const vexaAddDependencyRegex =
    /<vexa-add-dependency packages="([^"]+)">[^<]*<\/vexa-add-dependency>/g;
  let match;
  const packages: string[] = [];
  while ((match = vexaAddDependencyRegex.exec(fullResponse)) !== null) {
    packages.push(...match[1].split(" "));
  }
  return packages;
}

export function getVexaChatSummaryTag(fullResponse: string): string | null {
  const vexaChatSummaryRegex =
    /<vexa-chat-summary>([\s\S]*?)<\/vexa-chat-summary>/g;
  const match = vexaChatSummaryRegex.exec(fullResponse);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

export function getVexaExecuteSqlTags(fullResponse: string): SqlQuery[] {
  const vexaExecuteSqlRegex =
    /<vexa-execute-sql([^>]*)>([\s\S]*?)<\/vexa-execute-sql>/g;
  const descriptionRegex = /description="([^"]+)"/;
  let match;
  const queries: { content: string; description?: string }[] = [];

  while ((match = vexaExecuteSqlRegex.exec(fullResponse)) !== null) {
    const attributesString = match[1] || "";
    let content = match[2].trim();
    const descriptionMatch = descriptionRegex.exec(attributesString);
    const description = descriptionMatch?.[1];

    // Handle markdown code blocks if present
    const contentLines = content.split("\n");
    if (contentLines[0]?.startsWith("```")) {
      contentLines.shift();
    }
    if (contentLines[contentLines.length - 1]?.startsWith("```")) {
      contentLines.pop();
    }
    content = contentLines.join("\n");

    queries.push({ content, description });
  }

  return queries;
}

export function getVexaCommandTags(fullResponse: string): string[] {
  const vexaCommandRegex =
    /<vexa-command type="([^"]+)"[^>]*><\/vexa-command>/g;
  let match;
  const commands: string[] = [];

  while ((match = vexaCommandRegex.exec(fullResponse)) !== null) {
    commands.push(match[1]);
  }

  return commands;
}
