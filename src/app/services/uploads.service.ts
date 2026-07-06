import { API_BASE_URL } from '../config/api';

export const uploadsService = {
  uploadReceipt: async (file: File): Promise<{ url: string }> => {
    const token = localStorage.getItem('agro-token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/uploads/receipt`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(body.message || 'Error al subir el archivo');
    }

    // El backend envuelve las respuestas exitosas en { success, data, timestamp }
    return body && body.success === true && 'data' in body ? body.data : body;
  },

  uploadProductImage: async (file: File): Promise<{ url: string }> => {
    const token = localStorage.getItem('agro-token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/uploads/product-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(body.message || 'Error al subir la imagen');
    }

    return body && body.success === true && 'data' in body ? body.data : body;
  },
};
