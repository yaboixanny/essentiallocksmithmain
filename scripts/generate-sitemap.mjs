import { execFileSync } from "node:child_process";
import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteUrl = "https://essentiallocksmith.com";
const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(rootDirectory, "sitemap.xml");

const escapeXml = (value) => value.replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;"
})[character]);

const listHtmlFiles = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "node_modules") {
            continue;
        }

        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...await listHtmlFiles(entryPath));
        } else if (entry.isFile() && entry.name.endsWith(".html")) {
            files.push(entryPath);
        }
    }

    return files;
};

const lastModified = async (filePath) => {
    try {
        return execFileSync("git", ["log", "-1", "--format=%cs", "--", path.relative(rootDirectory, filePath)], {
            cwd: rootDirectory,
            encoding: "utf8"
        }).trim();
    } catch {
        return (await stat(filePath)).mtime.toISOString().slice(0, 10);
    }
};

const htmlFiles = await listHtmlFiles(rootDirectory);
const urls = await Promise.all(htmlFiles.sort().map(async (filePath) => {
    const relativePath = path.relative(rootDirectory, filePath).split(path.sep).join("/");
    const urlPath = relativePath === "index.html" ? "/" : "/" + relativePath.replace(/\.html$/, "");

    return {
        lastModified: await lastModified(filePath),
        location: siteUrl + urlPath
    };
}));

const urlEntries = urls.map(({ location, lastModified }) => "  <url>\n" +
    "    <loc>" + escapeXml(location) + "</loc>\n" +
    "    <lastmod>" + lastModified + "</lastmod>\n" +
    "  </url>").join("\n");
const sitemap = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n" +
    urlEntries + "\n</urlset>\n";

await writeFile(outputPath, sitemap, "utf8");
console.log("Generated sitemap.xml with " + urls.length + " URLs.");
