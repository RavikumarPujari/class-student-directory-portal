import ExcelJS from "exceljs";
import { Student } from "@prisma/client";

const COLUMNS = [
  { header: "Name", key: "name", width: 24 },
  { header: "USN", key: "usn", width: 16 },
  { header: "Section", key: "section", width: 10 },
  { header: "Phone", key: "phone", width: 16 },
  { header: "Email", key: "email", width: 28 },
  { header: "LinkedIn", key: "linkedin", width: 32 },
  { header: "GitHub", key: "github", width: 32 },
  { header: "Portfolio", key: "portfolio", width: 32 },
  { header: "Favorite Domain", key: "favoriteDomain", width: 20 },
  { header: "Skills", key: "skills", width: 30 },
  { header: "Bio", key: "bio", width: 40 },
  { header: "Registered On", key: "createdAt", width: 20 },
];

function escapeCsvValue(value: string): string {
  const needsQuoting = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}

export function studentsToCsv(students: Student[]): string {
  const header = COLUMNS.map((c) => c.header).join(",");
  const rows = students.map((s) =>
    COLUMNS.map((c) => {
      const raw = (s as any)[c.key];
      const value =
        c.key === "createdAt" && raw ? new Date(raw).toLocaleDateString() : raw ?? "";
      return escapeCsvValue(String(value));
    }).join(",")
  );
  return [header, ...rows].join("\n");
}

export async function studentsToExcelBuffer(students: Student[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Class Student Directory Portal";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Students");
  sheet.columns = COLUMNS as any;
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E293B" },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  students.forEach((s) => {
    sheet.addRow({
      ...s,
      createdAt: new Date(s.createdAt).toLocaleDateString(),
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
