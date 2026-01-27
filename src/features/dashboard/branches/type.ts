export interface Branch {
  guid: string;
  branchName: string;
  address: string;
  description: string;
}

export interface BranchesResponse {
  responseCode: string;
  responseMessage: string;
  errors: string[];
  responseData: {
    meta: {
      pageNumber: number;
      pageSize: number;
      pageCount: number;
      totalCount: number;
      numberOfPages: number;
    };
    records: Branch[];
  };
}

export interface BranchesQueryParams {
  searchKey?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateBranchPayload {
  guid?: string;
  branchName: string;
  address: string;
  description: string;
}

export interface BranchResponse {
  responseCode: string;
  responseMessage: string;
  errors: string[];
  responseData: Branch;
}
