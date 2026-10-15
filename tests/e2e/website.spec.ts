// Data tier T2: local static website with simulated interaction outcomes.
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

test("delegated bindings respect cancellation, disabled controls, iframe realms, and unbinding", async ({
  page,
}) => {
  await page.route(/\/sonant-test\/[a-z]+\.js$/, async (route) => {
    const file = new URL(route.request().url()).pathname.split("/").at(-1)!;
    await route.fulfill({
      body: await readFile(join(process.cwd(), "packages/sonant/dist", file)),
      contentType: "application/javascript",
    });
  });
  await page.goto("/");
  const played = await page.evaluate(async (prefix) => {
    const { createSoundSystem, bindSounds } = await import(prefix + "index.js");
    const events: string[] = [];
    const system = createSoundSystem({
      provider: {
        name: "DOM fixture",
        unlock: async () => true,
        play(event: string) {
          events.push(event);
          return { stop() {}, ended: Promise.resolve() };
        },
      },
    });
    const iframe = document.createElement("iframe");
    document.body.append(iframe);
    const root = iframe.contentDocument!.body;
    root.innerHTML =
      '<button data-sonant="action.press" disabled>Disabled</button><button id="cancel" data-sonant="action.release">Cancelled</button><button id="go" data-sonant="action.select">Enabled</button>';
    const unbind = bindSounds(root, system);
    root.querySelector("#cancel")!.addEventListener("click", (event) => event.preventDefault());
    for (const button of root.querySelectorAll("button")) button.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    unbind();
    root.querySelector("#go")!.setAttribute("data-sonant", "action.confirm");
    (root.querySelector("#go") as HTMLButtonElement).click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await system.destroy();
    iframe.remove();
    return events;
  }, "/sonant-test/");
  expect(played).toEqual(["action.select"]);
});

test("catalog renders, filters, and plays through native Web Audio", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const records: unknown[] = [];
    Object.defineProperty(window, "__sonantAudioDiagnostics", { value: records });
    const NativeContext = window.AudioContext;
    let sequence = 0;
    window.AudioContext = class extends NativeContext {
      private probeId: number;
      constructor(options?: AudioContextOptions) {
        super(options);
        this.probeId = ++sequence;
        records.push({
          id: this.probeId,
          event: "created",
          state: this.state,
          active: navigator.userActivation?.isActive,
        });
        this.addEventListener("statechange", () =>
          records.push({ id: this.probeId, event: "statechange", state: this.state }),
        );
      }
      async resume() {
        records.push({
          id: this.probeId,
          event: "resume",
          state: this.state,
          active: navigator.userActivation?.isActive,
        });
        try {
          await super.resume();
          records.push({ id: this.probeId, event: "resumed", state: this.state });
        } catch (error) {
          records.push({ id: this.probeId, event: "resume-error", error: String(error) });
          throw error;
        }
      }
    };
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("A little sound.");
  await page.screenshot({ path: testInfo.outputPath("home.png"), fullPage: true });
  await page.getByRole("button", { name: "Sound off", exact: true }).click();
  await page.getByRole("button", { name: "Preview Success", exact: true }).click();
  try {
    await expect(page.getByRole("status").filter({ hasText: "Playing success" })).toBeVisible();
  } catch (error) {
    const probe = await page.evaluate(async () => {
      let context: AudioContext | undefined;
      try {
        context = new AudioContext();
        const resumed = await Promise.race([
          context.resume().then(() => "resolved"),
          new Promise((resolve) => setTimeout(() => resolve("timeout"), 1500)),
        ]);
        return { resumed, state: context.state, sampleRate: context.sampleRate };
      } catch (cause) {
        return { error: String(cause) };
      } finally {
        if (context) void context.close();
      }
    });
    console.log("Native Web Audio diagnostic:", JSON.stringify(probe));
    console.log(
      "Audio lifecycle:",
      await page.evaluate(() =>
        JSON.stringify(
          (window as unknown as { __sonantAudioDiagnostics: unknown[] }).__sonantAudioDiagnostics,
        ),
      ),
    );
    await page.goto("/#/devtools");
    console.log("Sonant diagnostic:", await page.locator(".devtools-metrics").innerText());
    throw error;
  }
  if (testInfo.project.name === "firefox")
    console.log(
      "Firefox audio lifecycle:",
      await page.evaluate(() =>
        JSON.stringify(
          (window as unknown as { __sonantAudioDiagnostics: unknown[] }).__sonantAudioDiagnostics,
        ),
      ),
    );
  await page.screenshot({ path: testInfo.outputPath("preview.png") });
  await page.getByRole("textbox", { name: "Search sounds" }).fill("does-not-exist");
  await expect(page.getByText("No sounds found.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("button", { name: "Preview Success", exact: true })).toBeVisible();
  await page.goto("/#/devtools");
  await expect(page.locator(".trace-panel")).toContainText("state.success");
  await expect(page.locator(".trace-panel")).toContainText("played");
  expect(errors).toEqual([]);
});
test("configurator produces exact CLI options and a downloadable source bundle", async ({
  page,
}) => {
  await page.goto("/#/create");
  await page.getByRole("button", { name: /WARM & UNHURRIED/ }).click();
  await page.getByRole("button", { name: /quiet.*Outcomes/ }).click();
  await expect(page.locator(".builder-summary .code-block")).toContainText(
    "--theme soft --profile quiet",
  );
  await page.getByLabel("async-action", { exact: false }).check();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download source bundle" }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe("sonant-kit.json");
  const stream = await download.createReadStream();
  let content = "";
  for await (const chunk of stream!) content += chunk;
  const data = JSON.parse(content);
  expect(data.files["components/sonant/async-action.tsx"]).toContain("operation.reject");
  expect(JSON.parse(data.files["sonant.config.json"]).theme).toBe("soft");
});
test("examples resolve and fail visibly, native dialog restores focus", async ({ page }) => {
  await page.goto("/#/examples");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByText("Your changes have been saved.")).toBeVisible();
  await page.getByRole("button", { name: "Try failure" }).click();
  await expect(page.getByText("Could not save. Please try again.")).toBeVisible();
  const open = page.getByRole("button", { name: "Open a dialog" });
  await open.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(open).toBeFocused();
  await page.getByRole("button", { name: "Run workflow" }).click();
  await expect(page.getByText("Your summary is ready.")).toBeVisible();
});
test("mute persists, policy suppression is visible, and traces export", async ({ page }) => {
  await page.goto("/#/devtools");
  await page.getByRole("button", { name: "Sound off", exact: true }).click();
  await page.getByRole("button", { name: "Trigger a burst" }).click();
  await expect(page.locator("tbody")).toContainText("cooldown");
  await page.getByRole("button", { name: "Sound on", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Sound off", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Try an error" }).click();
  await expect(page.locator("tbody")).toContainText("muted");
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  expect((await downloaded).suggestedFilename()).toBe("sonant-trace.json");
});
for (const route of ["/", "/#/create", "/#/examples", "/#/devtools", "/#/docs"]) {
  test(`${route} has no serious accessibility violations or horizontal overflow`, async ({
    page,
  }) => {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations
        .filter((v) => ["serious", "critical"].includes(v.impact ?? ""))
        .map((v) => ({
          rule: v.id,
          nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        })),
      `${route} accessibility`,
    ).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `${route} overflow`,
    ).toBe(true);
  });
}
