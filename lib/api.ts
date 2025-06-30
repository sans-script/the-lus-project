const API_BASE_URL = "https://equipe-13-backend-trilhas-desafio-5.onrender.com";

function decodeJWT(token: string): any {
  try {
    const payload = token.split(".")[1];

    const decoded = decodeURIComponent(
      atob(payload)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user?: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface ApiFavoriteRequest {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  phoneNumber?: string;
  website?: string;
  types?: string[];
  addedAt: string;
  userId: string;
}

export interface ApiFavoriteResponse {
  firebaseId: string;
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  phoneNumber?: string;
  website?: string;
  types?: string[];
  addedAt: string;
  userId: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao fazer login");
    }

    const responseData = await response.json();
    if (responseData.token) {
      const jwtPayload = decodeJWT(responseData.token);
      if (jwtPayload && jwtPayload.id && jwtPayload.email && jwtPayload.name) {
        responseData.user = {
          id: jwtPayload.id,
          name: jwtPayload.name,
          email: jwtPayload.email,
        };
      }
    }

    return responseData;
  }

  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await fetch(`${this.baseURL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao cadastrar usuário");
    }

    return response.json();
  }

  async addFavorite(
    data: ApiFavoriteRequest,
    token: string,
  ): Promise<ApiFavoriteResponse> {
    const response = await fetch(`${this.baseURL}/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao adicionar favorito");
    }

    const result = await response.json();
    return result;
  }

  async getFavorites(
    userId: string,
    token: string,
  ): Promise<ApiFavoriteResponse[]> {
    const response = await fetch(`${this.baseURL}/favorites?userId=${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao buscar favoritos");
    }

    const result = await response.json();
    return result;
  }

  async removeFavorite(favoriteId: string, token: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/favorites/${favoriteId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao remover favorito");
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export async function addFavorite(
  data: ApiFavoriteRequest,
  token: string,
): Promise<ApiFavoriteResponse> {
  return apiClient.addFavorite(data, token);
}

export async function getFavorites(
  userId: string,
  token: string,
): Promise<ApiFavoriteResponse[]> {
  return apiClient.getFavorites(userId, token);
}

export async function removeFavorite(
  favoriteId: string,
  token: string,
): Promise<void> {
  return apiClient.removeFavorite(favoriteId, token);
}

function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}
