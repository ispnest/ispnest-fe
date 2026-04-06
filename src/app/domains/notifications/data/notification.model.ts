export type NotificationDto = {
  id: string;
  customerId: string;
  type: string;
  channel: string;
  subject: string | null;
  body: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  sentAt: string | null;
};

