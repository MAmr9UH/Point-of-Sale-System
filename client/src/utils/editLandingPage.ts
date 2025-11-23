import { authenticatedFetch } from "./jwtAuth";

/**
 * Updates the landing page/welcome page data
 * @param data Object containing the updated landing page fields
 * @returns Promise with the response data
 */
export interface UpdateLandingPageData {
  title: string;
  aboutText: string;
  backgroundImageUrl: string;
}

export interface UpdateLandingPageResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const updateLandingPage = async (
  data: UpdateLandingPageData
): Promise<UpdateLandingPageResponse> => {
  try {
    const response = await authenticatedFetch('/api/editpage/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: data.title,
        aboutText: data.aboutText,
        backgroundImageUrl: data.backgroundImageUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message || 'Landing page updated successfully!',
      data: result.data,
    };
  } catch (error) {
    console.error('Error updating landing page:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update landing page',
    };
  }
};
