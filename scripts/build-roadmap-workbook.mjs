import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.resolve("outputs", "roadmap-visual");
const outputPath = path.join(outputDir, "bible-challenge-roadmap.xlsx");

const font = "Arial";
const colors = {
  navy: "#1E3A5F",
  blue: "#2F6F9F",
  teal: "#2A7F7F",
  green: "#4E8B5A",
  amber: "#B7791F",
  red: "#B84A4A",
  purple: "#7251A5",
  gray: "#5F6B7A",
  lightBlue: "#DDEBF7",
  lightTeal: "#DCEFEF",
  lightGreen: "#E2F0D9",
  lightAmber: "#FCE4D6",
  lightPurple: "#EADCF8",
  lightGray: "#EEF1F4",
  header: "#233142",
  text: "#202B36",
  border: "#C9D2DC",
};

const phases = [
  {
    order: 1,
    milestone: "0.1.x",
    title: "Automated Testing Foundations",
    start: 1,
    duration: 1,
    issues: "#1-#3",
    open: 2,
    closed: 1,
    theme: "Testing",
    status: "In progress",
    dependency: "Current foundation. #1 is closed; #2 and #3 remain.",
    color: colors.blue,
  },
  {
    order: 2,
    milestone: "0.2.0",
    title: "Host Mode / Game Master Controls",
    start: 2,
    duration: 1,
    issues: "#8-#10",
    open: 3,
    closed: 0,
    theme: "Host play",
    status: "Planned",
    dependency: "Depends on #2.",
    color: colors.teal,
  },
  {
    order: 3,
    milestone: "0.3.0",
    title: "Phone Mode Stage 1",
    start: 3,
    duration: 1,
    issues: "#11-#14",
    open: 4,
    closed: 0,
    theme: "Phones",
    status: "Planned",
    dependency: "Depends on #8, #9, and #10.",
    color: colors.green,
  },
  {
    order: 4,
    milestone: "1.0.0",
    title: "Stabilization",
    start: 4,
    duration: 1,
    issues: "#15",
    open: 1,
    closed: 0,
    theme: "Release quality",
    status: "Planned",
    dependency: "Depends on #2, #4, #6, and #8-#14.",
    color: colors.amber,
  },
  {
    order: 5,
    milestone: "1.x",
    title: "Phone Mode Stages 2 and 3",
    start: 5,
    duration: 2,
    issues: "#16-#20",
    open: 5,
    closed: 0,
    theme: "Phones",
    status: "Flexible order",
    dependency: "Depends on #11-#14; #17 may ship before #16.",
    color: colors.green,
  },
  {
    order: 6,
    milestone: "1.x",
    title: "Tournament, Daily, and Map Modes",
    start: 5,
    duration: 2,
    issues: "#21-#23",
    open: 3,
    closed: 0,
    theme: "Game modes",
    status: "Flexible order",
    dependency: "#22 depends on #1; phone map interaction depends on #23.",
    color: colors.purple,
  },
  {
    order: 7,
    milestone: "1.x",
    title: "Themed Content and Licensing",
    start: 6,
    duration: 3,
    issues: "#24-#45",
    open: 22,
    closed: 0,
    theme: "Content",
    status: "Flexible order",
    dependency: "Groundwork #24-#30 precedes packs #38-#45; licensing #31-#37 before paid packs.",
    color: colors.blue,
  },
  {
    order: 8,
    milestone: "1.x",
    title: "Controller Extensions",
    start: 6,
    duration: 1,
    issues: "#49-#51",
    open: 3,
    closed: 0,
    theme: "Phones",
    status: "Prerequisite track",
    dependency: "Depends on #17; unblocks #62 and #69.",
    color: colors.red,
  },
  {
    order: 9,
    milestone: "1.x",
    title: "New Games and Variants",
    start: 7,
    duration: 3,
    issues: "#52-#71",
    open: 20,
    closed: 0,
    theme: "Games",
    status: "Flexible order",
    dependency: "Build shared/controller work first, then tracks whose dependencies are met.",
    color: colors.purple,
  },
  {
    order: 10,
    milestone: "Backlog",
    title: "Remaining Testing and CI",
    start: 4,
    duration: 5,
    issues: "#4-#7",
    open: 4,
    closed: 0,
    theme: "Testing",
    status: "Pull forward as needed",
    dependency: "#4 and #6 are 1.0 blockers through #15.",
    color: colors.gray,
  },
];

const milestones = [
  ["0.1.x - Automated Testing Foundations", "#1-#3", 2, 1, "Finish #2 and #3 before Host Mode."],
  ["0.2.0 - Host Mode / Game Master Controls", "#8-#10", 3, 0, "Main prerequisite for Phone Mode."],
  ["0.3.0 - Phone Mode Stage 1", "#11-#14", 4, 0, "First network/firewall release."],
  ["1.0.0 - Stabilization", "#15", 1, 0, "No new features; release quality gate."],
  ["1.x - Phone Mode Stages 2 and 3", "#16-#20", 5, 0, "Typed answers and full phone interaction."],
  ["1.x - Tournament / Season Mode", "#21", 1, 0, "Persisted tournament data."],
  ["1.x - Daily Challenge Pack", "#22", 1, 0, "Depends on seeded randomness from #1."],
  ["1.x - Bible Map Challenge", "#23", 1, 0, "Prerequisite for phone map interaction."],
  ["1.x - Themed Content Groundwork", "#24-#30", 7, 0, "Pack model, categories, seasons, first packs."],
  ["1.x - Content Licensing", "#31-#37", 7, 0, "Locked packs and distribution prerequisites."],
  ["1.x.y - Themed Content Packs", "#38-#45", 8, 0, "Individual seasonal packs."],
  ["Backlog - Remaining Testing and CI", "#4-#7", 4, 0, "Admin, cross-app, visual, and CI tests."],
  ["1.x - Controller: Private Choice and Number Input", "#49-#51", 3, 0, "Unblocks private phone games."],
  ["1.x - New Games: Progressive Reveal Content Batch", "#52-#55", 4, 0, "Reuse existing engine patterns."],
  ["1.x - Timeline Sub-Modes", "#56-#57", 2, 0, "Extends existing timeline game."],
  ["1.x - Director's Cut Presentation Variant", "#58", 1, 0, "Two Truths variant."],
  ["1.x - Bible Baseball", "#59-#64", 6, 0, "Baseball game track."],
  ["1.x - Bible Blockbusters", "#65-#68", 4, 0, "Hex board game track."],
  ["1.x - Forbidden Words", "#69-#71", 3, 0, "Private clue-giver flow."],
];

const issueRows = [
  ["#1", "Testing foundations", "0.1.x", "Closed", "None", "Done"],
  ["#2", "Layer 1 game logic tests", "0.1.x", "Open", "#1", "Next"],
  ["#3", "Playwright + Electron setup", "0.1.x", "Open", "#1", "Next"],
  ["#4", "Challenge app feature tests", "Backlog", "Open", "#3, #8, #9, #10", "1.0 blocker"],
  ["#5", "Admin and cross-app tests", "Backlog", "Open", "#3", "Backlog"],
  ["#6", "Visual regression baselines", "Backlog", "Open", "#3", "1.0 blocker"],
  ["#7", "CI pipeline", "Backlog", "Open", "None", "Optional"],
  ["#8-#10", "Host Mode phases", "0.2.0", "Open", "#2", "Next after tests"],
  ["#11-#14", "Phone Mode Stage 1", "0.3.0", "Open", "#8, #9, #10", "Next after Host Mode"],
  ["#15", "1.0 stabilization checklist", "1.0.0", "Open", "#2, #4, #6, #8-#14", "Release gate"],
  ["#16-#20", "Phone Mode Stages 2 and 3", "1.x", "Open", "#11-#14, #23 for map", "Flexible"],
  ["#21-#23", "Tournament, Daily, Map", "1.x", "Open", "#1 for Daily", "Flexible"],
  ["#24-#45", "Themed content and licensing", "1.x", "Open", "Groundwork before packs", "Flexible"],
  ["#49-#51", "Controller extensions", "1.x", "Open", "#17", "Prerequisite"],
  ["#52-#71", "New games and variants", "1.x", "Open", "Track-specific dependencies", "Flexible"],
];

function setupSheet(sheet) {
  sheet.showGridLines = false;
  sheet.getRange("A1:Z120").format.font = { name: font, size: 10, color: colors.text };
  sheet.getRange("A1:Z120").format.verticalAlignment = "center";
}

function styleTitle(sheet, title, subtitle = "") {
  sheet.getRange("B2").values = [[title]];
  sheet.getRange("B2").format.font = { name: font, size: 16, bold: true, color: colors.text };
  sheet.getRange("B3").values = [[subtitle]];
  sheet.getRange("B3").format.font = { name: font, size: 10, italic: true, color: colors.gray };
  sheet.getRange("B4:O4").format.borders = { bottom: { style: "thin", color: colors.border } };
}

function styleTableHeader(range) {
  range.format.fill = colors.header;
  range.format.font = { name: font, bold: true, color: "#FFFFFF", size: 10 };
  range.format.horizontalAlignment = "center";
  range.format.wrapText = true;
}

function styleTable(range) {
  range.format.borders = { preset: "outside", style: "thin", color: colors.border };
  range.format.verticalAlignment = "center";
}

const workbook = Workbook.create();

const dashboard = workbook.worksheets.add("Dashboard");
const msSheet = workbook.worksheets.add("Milestones");
const issueSheet = workbook.worksheets.add("Issue Map");
const dataSheet = workbook.worksheets.add("Chart Data");

dashboard.tabColor = colors.navy;
msSheet.tabColor = colors.blue;
issueSheet.tabColor = colors.teal;
dataSheet.tabColor = colors.lightGray;

for (const sheet of [dashboard, msSheet, issueSheet, dataSheet]) setupSheet(sheet);

styleTitle(dashboard, "Bible Challenge Roadmap", "Visual roadmap generated from GitHub milestones and ROADMAP.md after dependency cleanup.");

dashboard.getRange("B6:E8").values = [
  ["Near-term path", "0.1.x", "0.2.0", "0.3.0"],
  ["Focus", "Tests", "Host Mode", "Phone Buzz"],
  ["Primary blockers", "#2, #3", "#8-#10", "#11-#14"],
];
styleTableHeader(dashboard.getRange("B6:E6"));
styleTable(dashboard.getRange("B6:E8"));

dashboard.getRange("G6:J8").values = [
  ["Release gate", "1.0.0", "Flexible 1.x", "Backlog"],
  ["Focus", "Stabilize", "Feature tracks", "Deeper tests"],
  ["Primary blockers", "#15", "#16-#71", "#4-#7"],
];
styleTableHeader(dashboard.getRange("G6:J6"));
styleTable(dashboard.getRange("G6:J8"));

const stepLabels = ["0.1.x", "0.2.0", "0.3.0", "1.0", "Phone 1.x", "Modes", "Content", "Controller", "Games"];
dashboard.getRange("B11:O11").values = [["Track", "Milestone", "Issues", "Status", ...stepLabels, "Dependency note"]];
styleTableHeader(dashboard.getRange("B11:O11"));

const timelineRows = phases.map((p) => [
  p.title,
  p.milestone,
  p.issues,
  p.status,
  ...Array.from({ length: 9 }, (_, idx) => {
    const step = idx + 1;
    return step >= p.start && step < p.start + p.duration ? "■" : "";
  }),
  p.dependency,
]);
dashboard.getRangeByIndexes(11, 1, timelineRows.length, 14).values = timelineRows;
styleTable(dashboard.getRange(`B11:O${11 + timelineRows.length}`));
dashboard.getRange(`E12:M${11 + timelineRows.length}`).format.horizontalAlignment = "center";
dashboard.getRange(`O12:O${11 + timelineRows.length}`).format.wrapText = true;

for (let i = 0; i < phases.length; i++) {
  const row = 12 + i;
  dashboard.getRange(`E${row}:M${row}`).format.font = { name: font, size: 13, bold: true, color: phases[i].color };
  dashboard.getRange(`B${row}`).format.font = { name: font, bold: true, color: colors.text };
}

dashboard.getRange("B24").values = [["Read this left to right: each step is an intended sequence bucket, not a calendar date. Backlog testing can be pulled forward when a feature touches that surface."]];
dashboard.getRange("B24:O24").merge();
dashboard.getRange("B24").format.font = { name: font, italic: true, color: colors.gray, size: 10 };

const statusData = [
  ["Track", "Open issues"],
  ...phases.map((p) => [p.title, p.open]),
];
dashboard.getRangeByIndexes(26, 1, statusData.length, 2).values = statusData;
styleTableHeader(dashboard.getRange("B27:C27"));
styleTable(dashboard.getRange(`B27:C${27 + phases.length}`));

const chart = dashboard.charts.add("bar", dashboard.getRange(`B27:C${27 + phases.length}`));
chart.title = "Open issues by roadmap track";
chart.titleTextStyle.typeface = font;
chart.titleTextStyle.fontSize = 12;
chart.hasLegend = false;
chart.xAxis = { axisType: "textAxis", textStyle: { typeface: font, fontSize: 9 } };
chart.yAxis = { numberFormatCode: "0", numberFormatSourceLinked: false, textStyle: { typeface: font, fontSize: 9 } };
chart.setPosition("E27", "O45");
chart.series.items[0].fill = colors.blue;

styleTitle(msSheet, "Milestone Summary", "Open/closed counts and planning notes by GitHub milestone.");
msSheet.getRange("B6:F6").values = [["Milestone", "Issues", "Open", "Closed", "Planning note"]];
styleTableHeader(msSheet.getRange("B6:F6"));
msSheet.getRangeByIndexes(6, 1, milestones.length, 5).values = milestones;
styleTable(msSheet.getRange(`B6:F${6 + milestones.length}`));
msSheet.getRange(`A1:F${7 + milestones.length}`).format.autofitColumns();
msSheet.getRange("B:B").format.columnWidth = 42;
msSheet.getRange("F:F").format.columnWidth = 58;
msSheet.getRange(`F7:F${6 + milestones.length}`).format.wrapText = true;
msSheet.freezePanes.freezeRows(6);

const msChartData = [["Milestone", "Open"], ...milestones.map((m) => [m[0].replace(" - ", "\n"), m[2]])];
msSheet.getRangeByIndexes(28, 1, msChartData.length, 2).values = msChartData;
const msChart = msSheet.charts.add("bar", msSheet.getRangeByIndexes(28, 1, msChartData.length, 2));
msChart.title = "Open issues by milestone";
msChart.titleTextStyle.typeface = font;
msChart.titleTextStyle.fontSize = 12;
msChart.hasLegend = false;
msChart.xAxis = { axisType: "textAxis", textStyle: { typeface: font, fontSize: 8 } };
msChart.yAxis = { numberFormatCode: "0", numberFormatSourceLinked: false, textStyle: { typeface: font, fontSize: 9 } };
msChart.setPosition("H6", "N28");
msChart.series.items[0].fill = colors.teal;

styleTitle(issueSheet, "Issue Relationship Map", "Grouped issue references, blockers, and planning action.");
issueSheet.getRange("B6:G6").values = [["Issues", "Work item", "Milestone", "Status", "Depends on", "Planning action"]];
styleTableHeader(issueSheet.getRange("B6:G6"));
issueSheet.getRangeByIndexes(6, 1, issueRows.length, 6).values = issueRows;
styleTable(issueSheet.getRange(`B6:G${6 + issueRows.length}`));
issueSheet.getRange(`F7:G${6 + issueRows.length}`).format.wrapText = true;
issueSheet.getRange("A1:G40").format.autofitColumns();
issueSheet.getRange("C:C").format.columnWidth = 34;
issueSheet.getRange("F:F").format.columnWidth = 32;
issueSheet.getRange("G:G").format.columnWidth = 22;
issueSheet.freezePanes.freezeRows(6);

styleTitle(dataSheet, "Chart Data", "Source data used by the roadmap charts.");
dataSheet.getRange("B6:K6").values = [["Order", "Milestone", "Track", "Start step", "Duration", "Open", "Closed", "Issues", "Theme", "Dependency note"]];
styleTableHeader(dataSheet.getRange("B6:K6"));
dataSheet.getRangeByIndexes(6, 1, phases.length, 10).values = phases.map((p) => [p.order, p.milestone, p.title, p.start, p.duration, p.open, p.closed, p.issues, p.theme, p.dependency]);
styleTable(dataSheet.getRange(`B6:K${6 + phases.length}`));
dataSheet.getRange(`K7:K${6 + phases.length}`).format.wrapText = true;
dataSheet.getRange("A1:K25").format.autofitColumns();
dataSheet.getRange("D:D").format.columnWidth = 42;
dataSheet.getRange("K:K").format.columnWidth = 65;
dataSheet.freezePanes.freezeRows(6);

for (const sheet of [dashboard, msSheet, issueSheet, dataSheet]) {
  sheet.getRange("A:A").format.columnWidth = 2;
}
dashboard.getRange("B:B").format.columnWidth = 35;
dashboard.getRange("C:C").format.columnWidth = 14;
dashboard.getRange("D:D").format.columnWidth = 18;
dashboard.getRange("E:M").format.columnWidth = 9;
dashboard.getRange("N:N").format.columnWidth = 9;
dashboard.getRange("O:O").format.columnWidth = 52;

workbook.recalculate();

await fs.mkdir(outputDir, { recursive: true });

const dashPreview = await workbook.render({ sheetName: "Dashboard", autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile(path.join(outputDir, "dashboard-preview.png"), new Uint8Array(await dashPreview.arrayBuffer()));
const milestonePreview = await workbook.render({ sheetName: "Milestones", autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile(path.join(outputDir, "milestones-preview.png"), new Uint8Array(await milestonePreview.arrayBuffer()));
const issuePreview = await workbook.render({ sheetName: "Issue Map", autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile(path.join(outputDir, "issue-map-preview.png"), new Uint8Array(await issuePreview.arrayBuffer()));

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

const summary = await workbook.inspect({
  kind: "table,drawing",
  sheetId: "Dashboard",
  range: "B2:K45",
  tableMaxRows: 30,
  tableMaxCols: 12,
  maxChars: 6000,
});
console.log(summary.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(`saved=${outputPath}`);
