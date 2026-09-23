/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Teacher, Staff, SchoolSettings, ActivityLog, MutationApplication } from '../types';

export const DATABASE_FILENAME = 'buku_induk_siswa_database.json';

export interface DriveDatabasePayload {
  version: string;
  appName: string;
  updatedAt: string;
  updatedBy?: string;
  data: {
    students: Student[];
    teachers: Teacher[];
    staff: Staff[];
    settings: SchoolSettings;
    activityLogs?: ActivityLog[];
    mutationApplications?: MutationApplication[];
  };
}

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
}

/**
 * Searches for the existing database file on the user's Google Drive.
 */
export async function findDatabaseFile(accessToken: string): Promise<DriveFileInfo | null> {
  const query = encodeURIComponent(`name = '${DATABASE_FILENAME}' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size,webViewLink)&pageSize=1`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Sesi Google Drive telah berakhir. Silakan hubungkan kembali akun Google Anda.');
    }
    const errText = await response.text();
    throw new Error(`Gagal mencari berkas di Google Drive: ${errText}`);
  }

  const result = await response.json();
  if (result.files && result.files.length > 0) {
    return result.files[0] as DriveFileInfo;
  }
  return null;
}

/**
 * Loads the database JSON content from Google Drive.
 */
export async function loadDatabaseFromDrive(accessToken: string, fileId: string): Promise<DriveDatabasePayload> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Gagal mengunduh basis data dari Google Drive (${response.status})`);
  }

  const payload = await response.json();
  if (!payload || !payload.data || !Array.isArray(payload.data.students)) {
    throw new Error('Struktur berkas di Google Drive tidak sesuai format Buku Induk Siswa.');
  }

  return payload as DriveDatabasePayload;
}

/**
 * Saves or updates the database file in Google Drive.
 */
export async function saveDatabaseToDrive(
  accessToken: string,
  payload: DriveDatabasePayload,
  existingFileId?: string
): Promise<DriveFileInfo> {
  const fileContent = JSON.stringify(payload, null, 2);

  if (existingFileId) {
    // Update existing file content
    const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`;
    const updateRes = await fetch(uploadUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: fileContent
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`Gagal memperbarui berkas di Google Drive: ${errText}`);
    }

    const updatedInfo = await updateRes.json();
    return {
      id: updatedInfo.id,
      name: updatedInfo.name,
      modifiedTime: new Date().toISOString()
    };
  } else {
    // Check if it already exists before creating to prevent duplicates
    const found = await findDatabaseFile(accessToken);
    if (found) {
      return saveDatabaseToDrive(accessToken, payload, found.id);
    }

    // Create a new file using multipart upload
    const metadata = {
      name: DATABASE_FILENAME,
      mimeType: 'application/json',
      description: 'Pangkalan Data Utama Buku Induk Siswa Digital SMP Negeri 3 Kras'
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const createRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Gagal membuat berkas baru di Google Drive: ${errText}`);
    }

    const createdInfo = await createRes.json();
    return createdInfo as DriveFileInfo;
  }
}
