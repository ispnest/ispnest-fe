export type IntegrationConfigDto = {
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

export type ConfigValueRequest = {
  value: string;
  description?: string | null;
  sensitive?: boolean | null;
}

export type ConfigUpdateRequest = {
  value: string;
}

