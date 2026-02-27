import { useQuery, useQueryClient } from '@tanstack/react-query';

// Simplified URL sanitization
export const sanitizeUrl = (path: string): string => {
    return path
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9\-_./]/g, '')
        .replace(/-+/g, '-')
        .replace(/\.\./g, '')
        .replace(/^[-\/]+/, '')
        .replace(/\/+/g, '/')
        .replace(/[-\/]+$/, '');
};

// Stub function - no longer used since photo functionality removed
export const getFileUrl = async (path: string): Promise<string> => {
    if (!path || path.trim() === '') {
        throw new Error('Invalid file path');
    }
    return '';
};

// Stub hook - no longer used since photo functionality removed
export const useFileList = () => {
    return useQuery({
        queryKey: ['fileList'],
        queryFn: async () => {
            return [];
        },
        enabled: false,
    });
};

// Stub hook - no longer used since photo functionality removed
export const useFileUrl = (path: string) => {
    return useQuery({
        queryKey: ['fileUrl', path],
        queryFn: async () => {
            return null;
        },
        enabled: false,
    });
};

// Stub utility - no longer used since photo functionality removed
export const useInvalidateQueries = () => {
    const queryClient = useQueryClient();

    return {
        invalidateFileList: () => {},
        invalidateFileUrl: (path: string) => {},
        invalidateAllFileUrls: () => {},
        invalidateAll: () => {},
        refetchFileUrl: async (path: string) => {},
        prefetchFileUrl: (path: string) => {},
        setFileUrl: (path: string, url: string) => {},
        resetFileUrlError: (path: string) => {},
        refreshFileUrl: async (path: string) => {},
    };
};
