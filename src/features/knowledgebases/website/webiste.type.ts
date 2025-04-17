import mongoose from "mongoose";
import { CrawledUrlStatus } from "src/core/constants/global.enum";

export interface CrawledUrlAggregationResult {
  _id: mongoose.Types.ObjectId; 
  totalRecords: number;
  statusCounts: Array<{
    status: CrawledUrlStatus;
    count: number;
  }>;
}


export interface SessionStatusStats {
  sessionId: string;
  totalRecords: number;
  statusCounts: {
    [key in CrawledUrlStatus]?: number;
  };
}