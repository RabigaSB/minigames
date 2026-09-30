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
export interface GamesResponse {
  data: ApiGame[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    appliedFilter: {
      category: string;
      sort: string;
    };
  };
}
export interface LeaderboardPlayer {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameSlug: string;
  favoriteGameName: string;
}
export interface ApiCategory {
  slug: string;
  label: string;
  isDefault: boolean;
}
export interface CategoriesResponse {
  data: ApiCategory[];
  meta: {
    totalItems: number;
    description: string;
    additionalProp1?: Record<string, unknown>;
  };
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  const url = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api/categories';
  const response = await fetch(url);

  if (!response.ok) {
    let errorMessage = `HTTP Error: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Fallback if error body is not json
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

export async function fetchLeaderboard(): Promise<LeaderboardPlayer[]> {
  const url = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api/leaderboard';
  const response = await fetch(url);

  if (!response.ok) {
    let errorMessage = `HTTP Error: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Fallback if not json
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.data;
}

export async function fetchGames(
  params: {
    featured?: boolean;
    page?: number;
    limit?: number;
    category?: string;
    sort?: string;
  } = {},
): Promise<GamesResponse> {
  const queryParams = new URLSearchParams();

  if (params.featured !== undefined) {
    queryParams.append('featured', String(params.featured));
  }
  if (params.page !== undefined) {
    queryParams.append('page', String(params.page));
  }
  if (params.limit !== undefined) {
    queryParams.append('limit', String(params.limit));
  }
  if (params.category !== undefined) {
    queryParams.append('category', params.category);
  }
  if (params.sort !== undefined) {
    queryParams.append('sort', params.sort);
  }

  const url = `https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api/games?${queryParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    let errorMessage = `HTTP Error: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Fallback if error body is not json
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}
