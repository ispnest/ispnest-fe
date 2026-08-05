export type ChannelStatusDto = {
  notificationId: string;
  channel: string;
  status: string;
  failureReason: string | null;
  sentAt: string | null;
  readAt: string | null;
};

export type NotificationGroupDto = {
  groupId: string;
  customerId: string;
  accountCode: string | null;
  category: string;
  referenceType: string | null;
  referenceId: string | null;
  subject: string | null;
  body: string;
  createdAt: string;
  channels: ChannelStatusDto[];
};
