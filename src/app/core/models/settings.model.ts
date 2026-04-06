export interface IntegrationConfigDto {
  id: string;
  provider: string;
  configKey: string;
  configValue: string;
  description: string | null;
  sensitive: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigValueRequest {
  value: string;
  description?: string | null;
  sensitive?: boolean | null;
}

export interface ConfigUpdateRequest {
  value: string;
}

