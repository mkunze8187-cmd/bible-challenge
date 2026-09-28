import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";
import data from "./roadmap-data.json" with { type: "json" };

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

// Roadmap content lives in roadmap-data.json so other renderers can share it.
const phases = data.phases.map((p) => ({ ...p, color: colors[p.color] }));
const { milestones, issueRows, stepLabels } = data;

const colLetter = (index) => String.fromCharCode(65 + index); // 0 -> A
const firstStepCol = 5; // F
const lastStepCol = colLetter(firstStepCol + stepLabels.length - 1);
const noteCol = colLetter(firstStepCol + stepLabels.length);

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

styleTitle(dashboard, data.title, data.subtitle);

dashboard.getRange("B6:E8").values = data.nearTerm;
styleTableHeader(dashboard.getRange("B6:E6"));
styleTable(dashboard.getRange("B6:E8"));

dashboard.getRange("G6:J8").values = data.releaseGate;
dashboard.getRange("G6:J8").format.wrapText = true;
styleTableHeader(dashboard.getRange("G6:J6"));
styleTable(dashboard.getRange("G6:J8"));

dashboard.getRange(`B11:${noteCol}11`).values = [["Track", "Milestone", "Issues", "Status", ...stepLabels, "Dependency note"]];
styleTableHeader(dashboard.getRange(`B11:${noteCol}11`));

const timelineRows = phases.map((p) => [
  p.title,
  p.milestone,
  p.issues,
  p.status,
  ...Array.from({ length: stepLabels.length }, (_, idx) => {
    const step = idx + 1;
    return step >= p.start && step < p.start + p.duration ? "■" : "";
  }),
  p.dependency,
]);
dashboard.getRangeByIndexes(11, 1, timelineRows.length, stepLabels.length + 5).values = timelineRows;
styleTable(dashboard.getRange(`B11:${noteCol}${11 + timelineRows.length}`));
dashboard.getRange(`E12:${lastStepCol}${11 + timelineRows.length}`).format.horizontalAlignment = "center";
dashboard.getRange(`${noteCol}12:${noteCol}${11 + timelineRows.length}`).format.wrapText = true;

for (let i = 0; i < phases.length; i++) {
  const row = 12 + i;
  dashboard.getRange(`E${row}:${lastStepCol}${row}`).format.font = { name: font, size: 13, bold: true, color: phases[i].color };
  dashboard.getRange(`B${row}`).format.font = { name: font, bold: true, color: colors.text };
}

const noteRow = 14 + phases.length;
dashboard.getRange(`B${noteRow}`).values = [[data.readingNote]];
dashboard.getRange(`B${noteRow}:${noteCol}${noteRow}`).merge();
dashboard.getRange(`B${noteRow}`).format.font = { name: font, italic: true, color: colors.gray, size: 10 };

const chartPhases = phases.filter((p) => p.open > 0); // finished tracks would be empty bars
const statusData = [
  ["Track", "Open issues"],
  ...chartPhases.map((p) => [p.title, p.open]),
];
const statusRow = noteRow + 3;
dashboard.getRangeByIndexes(statusRow - 1, 1, statusData.length, 2).values = statusData;
styleTableHeader(dashboard.getRange(`B${statusRow}:C${statusRow}`));
styleTable(dashboard.getRange(`B${statusRow}:C${statusRow + chartPhases.length}`));

const chart = dashboard.charts.add("bar", dashboard.getRange(`B${statusRow}:C${statusRow + chartPhases.length}`));
chart.title = "Open issues by roadmap track";
chart.titleTextStyle.typeface = font;
chart.titleTextStyle.fontSize = 12;
chart.hasLegend = false;
chart.xAxis = { axisType: "textAxis", textStyle: { typeface: font, fontSize: 9 } };
chart.yAxis = { numberFormatCode: "0", numberFormatSourceLinked: false, textStyle: { typeface: font, fontSize: 9 } };
chart.setPosition(`E${statusRow}`, `${noteCol}${statusRow + 19}`);
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
const msChartIndex = 6 + milestones.length + 2;
msSheet.getRangeByIndexes(msChartIndex, 1, msChartData.length, 2).values = msChartData;
const msChart = msSheet.charts.add("bar", msSheet.getRangeByIndexes(msChartIndex, 1, msChartData.length, 2));
msChart.title = "Open issues by milestone";
msChart.titleTextStyle.typeface = font;
msChart.titleTextStyle.fontSize = 12;
msChart.hasLegend = false;
msChart.xAxis = { axisType: "textAxis", textStyle: { typeface: font, fontSize: 8 } };
msChart.yAxis = { numberFormatCode: "0", numberFormatSourceLinked: false, textStyle: { typeface: font, fontSize: 9 } };
msChart.setPosition("H6", "P32");
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
dashboard.getRange("E:E").format.columnWidth = 20;
dashboard.getRange(`F:${lastStepCol}`).format.columnWidth = 10;
dashboard.getRange(`${noteCol}:${noteCol}`).format.columnWidth = 52;

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
