export enum BucketStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface IBucket {
  _id: string;
  name: string;
  tenantId: string;
  status: BucketStatus;

  createdAt: Date;
  updatedAt: Date;
  createdBy: number | null;
  updatedBy: number | null;
}

export interface CreateBucket {
  name: string;
  tenantId: string;
  status: BucketStatus;
  createdBy: number | null;
  updatedBy: number| null
}

export type UpdateBucket = Partial<Pick<IBucket, 'name' | 'status' | 'updatedBy' | 'updatedAt'>>