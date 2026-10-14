import { API_BASE_URL } from '../config/api';

/** URL utilizable en el navegador: los archivos guardados localmente viven en el origen de la API. */
export function resolveFileUrl(url: string) {
  if (url.startsWith('/public/')) {
    try {
      return new URL(API_BASE_URL).origin + url;
    } catch {
      return url;
    }
  }
  return url;
}

export const isPdfUrl = (url: string) => /\.pdf(\?|#|$)/i.test(url);
