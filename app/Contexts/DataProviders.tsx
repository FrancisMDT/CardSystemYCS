// CombinedProviders.tsx
import { LoadingProvider } from "./LoadingContext";
import { SeniorCardDataProvider } from "./CardContext";
import { SnackbarProvider } from "./snackBarContext";
import { StateProvider } from "./stateContext";
import { UploadProvider } from "./uploadContext";
import { UserProvider } from "./userContext";
import { EncryptionProvider } from "./EncryptionContext";

interface DataProvidersProps {
	children: React.ReactNode; // Define the children prop
}

const DataProviders: React.FC<DataProvidersProps> = ({ children }) => {
	return (
		<LoadingProvider>
			<SnackbarProvider>
				<StateProvider>
					<EncryptionProvider>
					<UploadProvider>
						<UserProvider>
							<SeniorCardDataProvider>
						{children}
							</SeniorCardDataProvider>
						</UserProvider>
					</UploadProvider>
						</EncryptionProvider>
				</StateProvider>
			</SnackbarProvider>
		</LoadingProvider>
	);
};

export default DataProviders;
