export interface CreateKeyResponse {
    keyId: string;
}

export interface GetKeyResponse {
    keyId?: string;
    key: string;
    IV: string;
}

export interface KeyMetaData {
    creationTime: number;
    keyId: string;
    isEnabled: boolean
}
export interface IKEY {
    keyMetaData: KeyMetaData;
    key: string; //base64String
    iv: string; //base64String
}
