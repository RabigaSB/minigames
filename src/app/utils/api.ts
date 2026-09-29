export interface ApiGame {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
}

export async function fetchFeaturedGames(): Promise<ApiGame[]> {
  const url = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api/games?featured=true';
  const response = await fetch(url);

  if (!response.ok) {
    let errorMessage = `HTTP Error: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Fallback if response isn't JSON
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.data;
}
