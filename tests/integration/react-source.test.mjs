// Data tier T2: generated source and React server rendering; no browser/service I/O.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import ts from "typescript";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { SoundProvider, useSound } from "../../packages/sonant/dist/react.js";
import { createConfig, kitFiles } from "../../packages/sonant/dist/config.js";
import { registry } from "../../packages/sonant/dist/registry.js";

test("React provider renders on the server without a browser or AudioContext", () => {
  function Consumer() {
    const sound = useSound();
    return createElement("span", null, sound.preferences.profile);
  }
  assert.match(
    renderToString(createElement(SoundProvider, null, createElement(Consumer))),
    /balanced/,
  );
});
test("generated provider, every copied component, and editable themes compile as consumer source", async () => {
  await mkdir("tests/tmp", { recursive: true });
  const root = await mkdtemp(resolve("tests/tmp/generated-"));
  try {
    const config = createConfig();
    const files = {
      ...kitFiles(config),
      ...Object.fromEntries(
        Object.values(registry).map((item) => [`${config.directory}/${item.file}`, item.source]),
      ),
    };
    const sourceFiles = [];
    for (const [path, source] of Object.entries(files)) {
      const target = join(root, path);
      await mkdir(join(target, ".."), { recursive: true });
      await writeFile(target, source);
      if (path.endsWith(".tsx")) sourceFiles.push(target);
    }
    const program = ts.createProgram(sourceFiles, {
      noEmit: true,
      strict: true,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      resolveJsonModule: true,
      skipLibCheck: true,
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    assert.equal(
      diagnostics.length,
      0,
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (f) => f,
        getCurrentDirectory: () => root,
        getNewLine: () => "\n",
      }),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
