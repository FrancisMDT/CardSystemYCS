"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { SeniorCardModel, VLSearchResult } from "../models/SeniorCard/seniorCardModel";
import { searchSeniorCards } from "../services/seniorCardServices/searchService";
import { addSCDataService } from "../services/seniorCardServices/addService";
import { deleteSCDataService } from "../services/seniorCardServices/deleteService";
import { editSCDataService } from "../services/seniorCardServices/editService";
import { useSnackBar } from "./snackBarContext";
import { updateSCStatus } from "../services/seniorCardServices/SCStatusService";
import { searchVLService } from "../services/seniorCardServices/SearchVLService";
import { checkSCIDExists } from "../services/seniorCardServices/SCIDCheckService";
import { renameScidFiles } from "../services/imageServices/editImageNameService";
import { deleteImages } from "../services/imageServices/deleteImagesService";

type SeniorCardContextType = {
    SCData: Partial<SeniorCardModel>[];
    selectedSCData: Partial<SeniorCardModel> | null;
    setSelectedSCData: (sc: Partial<SeniorCardModel> | null) => void;
    loading: boolean;
    searchSCData: (query: string) => Promise<void>;
    selectSCData: (sc: Partial<SeniorCardModel> | null) => void;
    addSCData: (data: Partial<SeniorCardModel>) => Promise<void>;
    editSCData: (data: Partial<SeniorCardModel>) => Promise<void>;
    deleteSCData: (scid: string) => Promise<void>;

    markAsPrinted: (scid: string) => Promise<void>;
    revertPrintedStatus: (scid: string) => Promise<void>;

    idNumber: string;
    setIdNumber: React.Dispatch<React.SetStateAction<string>>;
    registration: "NR" | "R";
    setRegistration: (registration: "NR" | "R") => void;
    searchVLData: (query: string) => Promise<Partial<VLSearchResult>[]>;
    vlData: Partial<VLSearchResult>[];
    setVLData: React.Dispatch<React.SetStateAction<Partial<VLSearchResult>[]>>;
    scidExists: boolean;
    verifySCID: (scid: string) => Promise<boolean>;
    setScidExists: React.Dispatch<React.SetStateAction<boolean>>;

    canEditSCID: boolean;
    setCanEditSCID: React.Dispatch<React.SetStateAction<boolean>>;
    fetchSCIDMetadata: () => Promise<void>;
};

const SeniorCardDataContext = createContext<SeniorCardContextType | undefined>(undefined);

export const SeniorCardDataProvider = ({ children }: { children: ReactNode }) => {
    const [SCData, setSCData] = useState<Partial<SeniorCardModel>[]>([]);
    const [selectedSCData, setSelectedSCData] = useState<Partial<SeniorCardModel> | null>(null);
    const [loading, setLoading] = useState(false);

    const [idNumber, setIdNumber] = useState<string>(""); // make it explicit
    const [registration, setRegistration] = useState<"NR" | "R">("NR");

    const [vlData, setVLData] = useState<Partial<VLSearchResult>[]>([]);

    const { showSnackBar } = useSnackBar();

    const [currentQuery, setCurrentQuery] = useState<string>("");
    const [scidExists, setScidExists] = useState(false);

    const [canEditSCID, setCanEditSCID] = useState(false);

    const searchVLData = async (query: string) => {
        try {
            const results = await searchVLService(query);
            console.log("VL Search Results:", results);
            setVLData(results);
            return results;
        } catch (err) {
            console.error("Error in searchVLData:", err);
            return [];
        }
    };

    const verifySCID = async (scid: string) => {
        const exists = await checkSCIDExists(scid);
        setScidExists(exists);
        return exists;
    };

    // Updated search function to store the query
    const searchSCData = async (query: string) => {
        setCurrentQuery(query); // store the query
        setLoading(true);
        try {
            const results = await searchSeniorCards(query);
            setSCData(results);
        } catch (err) {
            console.error("Error searching SCData:", err);
            setSCData([]);
        } finally {
            setLoading(false);
        }
    };

    // Refresh function
    const refreshSCData = async () => {
        if (!currentQuery) return; // no query, nothing to refresh
        setLoading(true);
        try {
            const results = await searchSeniorCards(currentQuery);
            setSCData(results);
        } catch (err) {
            console.error("Error refreshing SCData:", err);
            setSCData([]);
        } finally {
            setLoading(false);
        }
    };

    const selectSCData = (sc: Partial<SeniorCardModel> | null) => {
        setSelectedSCData(sc);
    };

    const addSCData = async (data: Partial<SeniorCardModel>) => {
        setLoading(true);
        try {
            const newEntry = await addSCDataService(data);
            setSCData(prev => [newEntry, ...prev]);
        } catch (err: unknown) {
            showSnackBar(`Failed to add SCData: ${(err as Error)?.message ?? "Unknown error"}`, "error");
        } finally {
            setLoading(false);
            showSnackBar("SCData added successfully", "success");
            refreshSCData();
        }
    };

    const editSCData = async (
        data: Partial<SeniorCardModel> & { oldScid?: string; newScid?: string }
    ) => {
        setLoading(true);
        try {
            const updated = await editSCDataService(data);

            // Rename files only if SCID actually changed
            if (data.oldScid && data.newScid && data.oldScid !== data.newScid) {
                const result = await renameScidFiles(data.oldScid, data.newScid);
                if (result.success) {
                    console.log("Rename results:", result.results);
                } else {
                    console.error("Rename failed:", result);
                    showSnackBar("Files could not be renamed", "warning");
                }
            }

            // Update UI state
            setSCData(prev =>
                prev.map(sc => sc.scid === updated.scid ? updated : sc)
            );

            showSnackBar("SCData edited successfully", "success");
            refreshSCData();
        } catch (err) {
            console.error("Error editing SCData:", err);
            showSnackBar(
                `Failed to edit SCData: ${(err as Error)?.message ?? "Unknown error"}`,
                "error"
            );
        } finally {
            setLoading(false);
        }
    };



    const deleteSCData = async (scid: string, id?: string) => {
        setLoading(true);
        try {
            // Run both operations
            await deleteSCDataService({ id, scid });
            await deleteImages(scid);

            // Update UI state only if both succeed
            setSCData(prev => prev.filter(sc => sc.scid !== scid));
            showSnackBar("SCData deleted successfully", "success");
            refreshSCData();
        } catch (err) {
            console.error("Error deleting SCData:", err);
            showSnackBar(`Failed to delete SCData: ${(err as Error)?.message ?? "Unknown error"}`, "error");
        } finally {
            setLoading(false);
        }
    };



    const markAsPrinted = async (scid: string) => {
        setLoading(true);
        try {
            // Call your service to update the SC data
            const updated = await updateSCStatus({ scid, status: "PRINTED" });

            // Update your local state
            setSCData(prev =>
                prev.map(sc => (sc.scid === updated.scid ? updated : sc))
            );

            showSnackBar(`SC ${scid} marked as PRINTED`, "success");
        } catch (err) {
            console.error("Error marking SC as PRINTED:", err);
            showSnackBar(
                `Failed to mark SC as PRINTED: ${(err as Error)?.message ?? "Unknown error"}`,
                "error"
            );
        } finally {
            showSnackBar(`SC ${scid} marked as PRINTED`, "success");
            setLoading(false);
            refreshSCData();
        }
    };

    const revertPrintedStatus = async (scid: string) => {
        setLoading(true);
        try {
            const updated = await updateSCStatus({ scid, status: "ID" });
            setSCData(prev =>
                prev.map(sc => (sc.scid === updated.scid ? updated : sc))
            );
            showSnackBar(`SC ${scid} reverted to ID`, "success");
        } catch (err) {
            console.error("Error reverting SC status:", err);
            showSnackBar(
                `Failed to revert SC status: ${(err as Error)?.message ?? "Unknown error"}`,
                "error"
            );
        } finally {
            showSnackBar(`SC ${scid} reverted to ID`, "success");
            setLoading(false);
            refreshSCData();
        }
    };

    // async function handleScidUpdate(oldScid: string, newScid: string) {
    //     try {
    //         const result = await renameScidFiles(oldScid, newScid);
    //         if (result.success) {
    //             console.log("Rename results:", result.results);
    //         } else {
    //             console.error("Rename failed:", result);
    //         }
    //     } catch (error) {
    //         console.error("Rename service error:", error);
    //     }
    // }

    const fetchSCIDMetadata = async () => {
        try {
            const res = await fetch("/api/scid/metadata");
            const data = await res.json();
            if (data.success) setCanEditSCID(data.hasIdColumn);
        } catch (err) {
            console.error("Failed to fetch SCID metadata:", err);
            setCanEditSCID(false);
        }
    };

    useEffect(() => {
        fetchSCIDMetadata();
    }, []);

    return (
        <SeniorCardDataContext.Provider
            value={{
                SCData,
                selectedSCData,
                setSelectedSCData,
                loading,
                searchSCData,
                selectSCData,
                addSCData,
                editSCData,
                deleteSCData,
                markAsPrinted,
                revertPrintedStatus,
                idNumber,
                setIdNumber,
                registration,
                setRegistration,
                searchVLData,
                vlData,
                setVLData,
                scidExists,
                verifySCID,
                setScidExists,
                canEditSCID,
                setCanEditSCID,
                fetchSCIDMetadata,
            }}
        >
            {children}
        </SeniorCardDataContext.Provider>
    );
};

export const useSeniorCardDataContext = () => {
    const context = useContext(SeniorCardDataContext);
    if (!context) throw new Error("useSeniorCardData must be used within SeniorCardDataProvider");
    return context;
};
