export interface Branch {
  id: string;
  workspaceId: string;
  name: string;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}
