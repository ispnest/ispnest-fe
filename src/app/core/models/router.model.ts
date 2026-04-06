export interface RouterDto {
  id: string;
  name: string;
  ipAddress: string;
  username: string;
  description: string | null;
  coordinates: string | null;
  nasType: string;
  status: string;
  lastSeen: string | null;
}

export interface CreateRouterRequest {
  name: string;
  ipAddress: string;
  username: string;
  password?: string;
  description?: string | null;
  coordinates?: string | null;
  nasType: string;
}

export interface PoolDto {
  id: string;
  name: string;
  routerId: string;
  ranges: string;
  description: string | null;
  createdAt: string;
}

export interface CreatePoolRequest {
  name: string;
  routerId: string;
  ranges: string;
  description?: string | null;
}

