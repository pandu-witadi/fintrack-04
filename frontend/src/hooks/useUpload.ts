import { useState, useCallback } from 'react';
import { uploadService } from '../services/uploadService';

export interface UseUploadReturn {
    uploading: boolean;
    error: string | null;
    uploadImage: (file: File, trxId: string) => Promise<string>;
    removeImage: (trxId: string, filename: string) => Promise<void>;
    clearError: () => void;
}

export const useUpload = (): UseUploadReturn => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadImage = useCallback(async (file: File, trxId: string): Promise<string> => {
        try {
            setUploading(true);
            setError(null);
            const filename = await uploadService.uploadImage(file, trxId);
            return filename;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
            setError(errorMessage);
            console.error(err);
            throw err;
        } finally {
            setUploading(false);
        }
    }, []);

    const removeImage = useCallback(async (trxId: string, filename: string): Promise<void> => {
        try {
            setUploading(true);
            setError(null);
            await uploadService.removeImage(trxId, filename);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove image';
            setError(errorMessage);
            console.error(err);
            throw err;
        } finally {
            setUploading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        uploading,
        error,
        uploadImage,
        removeImage,
        clearError,
    };
};
