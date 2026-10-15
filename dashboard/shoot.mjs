import { chromium } from "playwright";
const tabs = ["Overview","Calculator","Startup costs","Licensing","How it works","Risks","Sources"];
const b = await chromium.launch();
for (const [vw, suf] of [[1440,""],[390,"-mobile"]]) {
  const p = await b.newPage({ viewport: { width: vw, height: 900 } });
  await p.goto("http://localhost:3000", { waitUntil: "networkidle" });
  for (const t of tabs) {
    await p.click(`button[data-tab="${t}"]`); await p.waitForTimeout(700);
    if (t === "Calculator" && !suf) {
      const txt = await p.locator("main").innerText();
      console.log(txt.match(/Net margin\n.*|Year-one fixed\n.*|Year-one profit\n.*|Break-even \(season\)\n.*|Break-even per week\n.*|Weekly profit.*\n.*/g));
    }
    if (suf && !["Overview","Calculator"].includes(t)) continue;
    await p.screenshot({ path: `shots/${t.toLowerCase().replace(/ /g,"-")}${suf}.png`, fullPage: true });
  }
}
await b.close();
