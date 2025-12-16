// CombinedProviders.tsx
import { LoadingProvider } from "./LoadingContext";
import { SeniorCardDataProvider } from "./CardContext";
import { SnackbarProvider } from "./snackBarContext";
import { StateProvider } from "./stateContext";
import { UploadProvider } from "./uploadContext";
import { UserProvider } from "./userContext";

interface DataProvidersProps {
	children: React.ReactNode; // Define the children prop
}

const DataProviders: React.FC<DataProvidersProps> = ({ children }) => {
	return (
		<LoadingProvider>
			<SnackbarProvider>
				<StateProvider>
					<UploadProvider>
						<UserProvider>
							<SeniorCardDataProvider>
						{children}
							</SeniorCardDataProvider>
						</UserProvider>
					</UploadProvider>
				</StateProvider>
			</SnackbarProvider>
		</LoadingProvider>
	);
};

export default DataProviders;
