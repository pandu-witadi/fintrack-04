import axios from 'axios';
import { userService } from './userService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5200/api';

export const uploadService = {
    async uploadImage(file: File, trxId: string): Promise<string> {
        const token = userService.getToken();

        const extension = file.name.split('.').pop();
        // const randomStr = Math.random().toString(36).substring(2, 9);
        // const filename = `${trxId}-${timestamp}-${randomStr}.${extension}`;
        // const filename = `${trxId}-${randomStr}.${extension}`;

        const formData = new FormData();
        formData.append('file', file);
        // formData.append('filename', filename);
        formData.append('extension', extension || ''); // Provide a default value if extension is undefined

        try {
            const response = await axios.post(`${API_BASE_URL}/upload/imageTrx/${trxId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                return response.data.filename;
            } else {
                throw new Error('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    },

    async removeImage(trxId: string, filename: string): Promise<void> {
        const token = userService.getToken();

        try {
            const response = await axios.delete(`${API_BASE_URL}/upload/removeImage/${trxId}/${filename}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.data.success) {
                throw new Error('Failed to remove image');
            }
        } catch (error) {
            console.error('Error removing image:', error);
            throw error;
        }
    },

    viewImage(filename: string): string {
        return `${API_BASE_URL}/upload/viewImage/${filename}`;
    }
};
