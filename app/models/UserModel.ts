export interface Account {
	user_id: string;
	full_name: string;
	username: string;
	password: string;
	address: string[];
	contact_no: string;
	access_level: string;
	status: string;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
}

// Interface for the main response object
export interface UserDataApiResponse {
	success: boolean;
	token: string;
	data: Account;
	full_name: string;
	access_level: string;
	// account: Account;
}

export interface UsersAPIResponse {
	success: boolean;
	data: Account[];
}

export interface UserSCID{
	Username: string;
	Password: string;
	Designation: string;
}

export interface UserSCIDAPIResponse {
	success: boolean;
	data: UserSCID;
}
