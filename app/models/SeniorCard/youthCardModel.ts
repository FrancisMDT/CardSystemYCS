export interface YouthCardModel {
    id?: number, // optional for new entries
    youthid: string,
    affiliates: string,
    fullName: string,
    birthDate: string,
    address: string,
    barangay: string,
    contactPerson: string,
    contactNum: string,
    contactAddress: string,
    status: string,
    dateID: string,
}

export interface YouthCardApiResponse {
    success: boolean,
    data: YouthCardModel[],
}

export interface VLSearchResult {
    idnum: string;
    fullname: string;
    address: string;
    brgy: string;
}