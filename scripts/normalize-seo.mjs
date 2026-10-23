import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteUrl = "https://essentiallocksmith.com";
const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlFiles = (await readdir(rootDirectory)).filter((fileName) => fileName.endsWith(".html"));

for (const fileName of htmlFiles) {
    const filePath = path.join(rootDirectory, fileName);
    const cleanPath = fileName === "index.html" ? "/" : "/" + fileName.replace(/\.html$/, "");
    const canonical = '<link rel="canonical" href="' + siteUrl + cleanPath + '">';
    let source = await readFile(filePath, "utf8");

    source = source.replace(/<link rel="canonical" href="[^"]*">\s*/i, "");
    source = source.replace(/(<head[^>]*>)/i, "$1\n    " + canonical);
    source = source.replace(/href="index\.html(?=("|#))/g, 'href="/"');
    source = source.replace(/href="([a-z0-9-]+)\.html(?=("|#))/gi, 'href="/$1');

    await writeFile(filePath, source, "utf8");
}

console.log("Normalized canonicals and clean internal URLs for " + htmlFiles.length + " pages.");
