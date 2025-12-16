export interface userPopulate {
    _id: string;
    name: string;
    email: string;
}

export interface projectPopulate {
    _id: string;
    name: string;
    code?: string;
}

export interface bankInfoPopulate {
    bankName: string;
    accName: string;
    accNo: string;
}
