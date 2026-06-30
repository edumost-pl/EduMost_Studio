import ExcelJS from 'exceljs';
import { dialog } from 'electron';
import { getDatabaseService } from './DatabaseService';
import { RepositoryRegistry } from '../repositories';

export type ReferenceExportType =
  | 'subjects'
  | 'sections'
  | 'lessonTypes'
  | 'lessonStatuses'
  | 'schoolClasses';

const FILE_NAMES: Record<ReferenceExportType, string> = {
  subjects: 'Subjects.xlsx',
  sections: 'Sections.xlsx',
  lessonTypes: 'LessonTypes.xlsx',
  lessonStatuses: 'Statuses.xlsx',
  schoolClasses: 'Classes.xlsx',
};

function getRepos(): RepositoryRegistry {
  return new RepositoryRegistry(getDatabaseService().getDatabase());
}

function addHeaderRow(sheet: ExcelJS.Worksheet, headers: string[]): void {
  const row = sheet.addRow(headers);
  row.font = { bold: true };
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' },
  };
}

export async function exportReferenceToExcel(
  type: ReferenceExportType,
): Promise<{ ok: boolean; path?: string; error?: string }> {
  const repos = getRepos();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'EduMost Studio';
  workbook.created = new Date();

  switch (type) {
    case 'subjects': {
      const sheet = workbook.addWorksheet('Subjects');
      addHeaderRow(sheet, ['Code', 'Icon', 'Name UA', 'Name PL', 'Active']);
      for (const item of repos.subjects.findAllForAdmin()) {
        sheet.addRow([
          item.code,
          item.icon ?? '',
          item.name_ua,
          item.name_pl,
          item.is_active ? 'Yes' : 'No',
        ]);
      }
      sheet.columns.forEach((column) => {
        column.width = 18;
      });
      break;
    }
    case 'sections': {
      const sheet = workbook.addWorksheet('Sections');
      addHeaderRow(sheet, ['Code', 'Subject', 'Name UA', 'Name PL', 'Active']);
      for (const item of repos.sections.findAllForAdmin()) {
        sheet.addRow([
          item.code,
          item.subject_name_ua,
          item.name_ua,
          item.name_pl,
          item.is_active ? 'Yes' : 'No',
        ]);
      }
      sheet.columns.forEach((column) => {
        column.width = 18;
      });
      break;
    }
    case 'lessonTypes': {
      const sheet = workbook.addWorksheet('LessonTypes');
      addHeaderRow(sheet, ['Name', 'Active']);
      for (const item of repos.lessonTypes.findAllForAdmin()) {
        sheet.addRow([item.name, item.is_active ? 'Yes' : 'No']);
      }
      sheet.columns.forEach((column) => {
        column.width = 24;
      });
      break;
    }
    case 'lessonStatuses': {
      const sheet = workbook.addWorksheet('Statuses');
      addHeaderRow(sheet, ['Name', 'Active']);
      for (const item of repos.lessonStatuses.findAllForAdmin()) {
        sheet.addRow([item.name, item.is_active ? 'Yes' : 'No']);
      }
      sheet.columns.forEach((column) => {
        column.width = 24;
      });
      break;
    }
    case 'schoolClasses': {
      const sheet = workbook.addWorksheet('Classes');
      addHeaderRow(sheet, ['Number', 'Name UA', 'Name PL', 'Active']);
      for (const item of repos.schoolClasses.findAllForAdmin()) {
        sheet.addRow([
          item.class_number,
          item.name_ua,
          item.name_pl,
          item.is_active ? 'Yes' : 'No',
        ]);
      }
      sheet.columns.forEach((column) => {
        column.width = 18;
      });
      break;
    }
    default:
      return { ok: false, error: 'Unknown export type' };
  }

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Export to Excel',
    defaultPath: FILE_NAMES[type],
    filters: [{ name: 'Excel Workbook', extensions: ['xlsx'] }],
  });

  if (canceled || !filePath) {
    return { ok: false };
  }

  try {
    await workbook.xlsx.writeFile(filePath);
    return { ok: true, path: filePath };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
