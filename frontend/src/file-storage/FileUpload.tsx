import { useState } from 'react';

// Stub hook - no longer used since photo functionality removed
export const useFileUpload = () => {
    const [isUploading, setIsUploading] = useState(false);

    const uploadFile = async (
        path: string,
        mimeType: string,
        data: Uint8Array,
        onProgress?: (percentage: number) => void
    ): Promise<{ path: string; hash: string; fileUrl: string }> => {
        throw new Error('File upload is not supported - photo functionality has been removed');
    };

    return { uploadFile, isUploading };
};
