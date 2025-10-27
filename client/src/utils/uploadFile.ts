
export const uploadFile = async (file: File): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:3000/api/editpage/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();
        const imageUrl = `http://localhost:3000${data.imageUrl}`;
        return imageUrl;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};
