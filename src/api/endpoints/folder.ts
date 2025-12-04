import { apiClient } from '../client';
import type { Folder } from '../../types';

export const folderApi = {
  // Create new folder
  create: (folderName: string) =>
    apiClient.post<number>('/folder', { folder_name: folderName }),

  // Get user's folders
  getAll: () =>
    apiClient.get<Folder[]>('/folder'),

  // Update folder name
  update: (folderId: number, folderName: string) =>
    apiClient.put<number>('/folder', { folder_id: folderId, folder_name: folderName }),

  // Delete folder
  delete: (folderId: number) =>
    apiClient.delete<string>('/folder', { data: { folder_id: folderId } }),

  // Add channel to folder
  addChannel: (folderId: number, channelId: number) =>
    apiClient.post('/folder/channel', { folder_id: folderId, channel_id: channelId }),

  // Remove channel from folder
  removeChannel: (folderId: number, channelId: number) =>
    apiClient.delete<string>('/folder/channel', {
      data: { folder_id: folderId, channel_id: channelId },
    }),
};
