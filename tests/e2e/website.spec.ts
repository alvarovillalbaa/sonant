// Data tier T2: local static website with simulated interaction outcomes.
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("catalog renders, filters, and plays through native Web Audio", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
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
    await page.goto("/#/devtools");
    console.log("Sonant diagnostic:", await page.locator(".devtools-metrics").innerText());
    throw error;
  }
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
