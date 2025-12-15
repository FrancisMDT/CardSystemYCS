export interface SeniorCardModel {
    id?: number, // optional for new entries
    scid: string,
    fullName: string,
    birthDate: string,
    address: string,
    contactPerson: string,
    contactNum: string,
    contactAddress: string,
    status: string,
    dateID: string,
}

export interface SeniorCardApiResponse {
    success: boolean,
    data: SeniorCardModel[],
}

export interface VLSearchResult {
    idnum: string;
    fullname: string;
    address: string;
    brgy: string;
}