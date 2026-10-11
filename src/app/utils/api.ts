const BASE_URL = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api';
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
export interface GameDetails {
  slug: string;
  name: string;
  heroImage: string;
  rating: number;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  fullDescription: string;
  specs: {
    genre: string;
    players: string;
    duration: string;
    price: string;
  };
  topRecords?: Array<{
    position: number;
    playerName: string;
    score: number;
    achievedAt: string;
  }>;
}
export interface GameDetailsResponse {
  data: GameDetails;
}

export interface GameComment {
  commentId: string;
  authorName: string;
  text: string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
}

export interface GameCommentsResponse {
  data: GameComment[];
  meta: {
    totalComments: number;
    returnedCount: number;
    sort: string;
  };
}

export async function fetchGameDetails(
  slug: string,
  userEmail?: string,
): Promise<GameDetailsResponse> {
  const queryParams = new URLSearchParams();
  if (userEmail) queryParams.set('userEmail', userEmail);
  const query = queryParams.size ? `?${queryParams.toString()}` : '';
  const url = `${BASE_URL}/games/${encodeURIComponent(slug)}${query}`;
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

export interface FavoriteResponse {
  data: {
    isFavorited: boolean;
    likesCount: number;
  };
}

export async function toggleGameFavorite(
  slug: string,
  userEmail: string,
): Promise<FavoriteResponse> {
  const response = await fetch(`${BASE_URL}/games/${encodeURIComponent(slug)}/favorite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail }),
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorMessage = errorData.error;
    } catch {
      // Fallback if error body is not JSON.
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

export async function fetchGameComments(
  slug: string,
  userEmail?: string,
): Promise<GameCommentsResponse> {
  const queryParams = new URLSearchParams({ limit: '3', sort: 'newest' });
  if (userEmail) queryParams.set('userEmail', userEmail);
  const url = `${BASE_URL}/games/${encodeURIComponent(slug)}/comments?${queryParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    let errorMessage = `HTTP Error: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Fallback if the error body is not JSON.
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

export interface CommentLikeResponse {
  data: {
    commentId: string;
    isLikedByCurrentUser: boolean;
    likesCount: number;
  };
}

export async function toggleCommentLike(
  commentId: string,
  userEmail: string,
): Promise<CommentLikeResponse> {
  const response = await fetch(`${BASE_URL}/comments/${encodeURIComponent(commentId)}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail }),
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorMessage = errorData.error;
    } catch {
      // Fallback if the error body is not JSON.
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

export class CommentSubmissionError extends Error {
  public readonly outcomeUnknown: boolean;

  constructor(message: string, outcomeUnknown: boolean) {
    super(message);
    this.name = 'CommentSubmissionError';
    this.outcomeUnknown = outcomeUnknown;
  }
}

export async function submitGameComment(
  slug: string,
  comment: { userEmail: string; authorName: string; text: string },
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/games/${encodeURIComponent(slug)}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });
  } catch {
    throw new CommentSubmissionError(
      'The result is unknown because the connection was interrupted. Check the comments before trying again.',
      true,
    );
  }

  if (response.status === 201) return;

  let errorMessage = `HTTP Error: ${response.status}`;
  try {
    const errorData = await response.json();
    if (errorData.error) errorMessage = errorData.error;
  } catch {
    // The HTTP status still indicates whether the request was rejected.
  }

  throw new CommentSubmissionError(errorMessage, response.status >= 500 || response.ok);
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  const url = `${BASE_URL}/categories`;
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
  const url = `${BASE_URL}/leaderboard`;
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

  const url = `${BASE_URL}/games?${queryParams.toString()}`;
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
