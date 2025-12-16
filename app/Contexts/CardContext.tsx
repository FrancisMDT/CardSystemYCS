"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { searchSeniorCards } from "../services/cardServices/searchService";
import { addSCDataService } from "../services/cardServices/addService";
import { deleteSCDataService } from "../services/cardServices/deleteService";
import { editSCDataService } from "../services/cardServices/editService";
import { useSnackBar } from "./snackBarContext";
import { updateSCStatus } from "../services/cardServices/SCStatusService";
import { searchVLService } from "../services/cardServices/SearchVLService";
import { checkSCIDExists } from "../services/cardServices/SCIDCheckService";
import { renameScidFiles } from "../services/imageServices/editImageNameService";
import { deleteImages } from "../services/imageServices/deleteImagesService";
import { VLSearchResult, YouthCardModel } from "../models/SeniorCard/youthCardModel";
import { generateYouthId } from "@/lib/generateYouthId";
import { generateYouthIdService } from "../services/cardServices/generateYouthIdService";

type SeniorCardContextType = {
    SCData: Partial<YouthCardModel>[];
    selectedSCData: Partial<YouthCardModel> | null;
    setSelectedSCData: (sc: Partial<YouthCardModel> | null) => void;
    loading: boolean;
    searchSCData: (query: string) => Promise<void>;
    selectSCData: (sc: Partial<YouthCardModel> | null) => void;
    addSCData: (data: Partial<YouthCardModel>) => Promise<string | undefined>;
    editSCData: (data: Partial<YouthCardModel>) => Promise<void>;
    deleteSCData: (youthid: string) => Promise<void>;

    markAsPrinted: (youthid: string) => Promise<void>;
    revertPrintedStatus: (youthid: string) => Promise<void>;

    idNumber: string;
    setIdNumber: React.Dispatch<React.SetStateAction<string>>;
    registration: "NR" | "R";
    setRegistration: (registration: "NR" | "R") => void;
    searchVLData: (query: string) => Promise<Partial<VLSearchResult>[]>;
    vlData: Partial<VLSearchResult>[];
    setVLData: React.Dispatch<React.SetStateAction<Partial<VLSearchResult>[]>>;
    scidExists: boolean;
    verifySCID: (youthid: string) => Promise<boolean>;
    setScidExists: React.Dispatch<React.SetStateAction<boolean>>;

    canEditSCID: boolean;
    setCanEditSCID: React.Dispatch<React.SetStateAction<boolean>>;
    fetchYouthIDMetadata: () => Promise<void>;    
};

const SeniorCardDataContext = createContext<SeniorCardContextType | undefined>(undefined);

export const SeniorCardDataProvider = ({ children }: { children: ReactNode }) => {
    const [SCData, setSCData] = useState<Partial<YouthCardModel>[]>([]);
    const [selectedSCData, setSelectedSCData] = useState<Partial<YouthCardModel> | null>(null);
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

    const selectSCData = (sc: Partial<YouthCardModel> | null) => {
        setSelectedSCData(sc);
    };

    const addSCData = async (data: Partial<YouthCardModel>) => {
        setLoading(true);
        try {
            
            const newEntry = await addSCDataService(data);
            refreshSCData();

            console.log("New SCData added:", newEntry);
            setSCData(prev => [newEntry, ...prev.filter(sc => sc.youthid !== newEntry.youthid)]);

            showSnackBar("SCData added successfully", "success");
            return newEntry.youthid;
        } catch (err: unknown) {
            console.error(err);
            showSnackBar(`Failed to add SCData: ${(err as Error)?.message ?? "Unknown error"}`, "error");
        } finally {
            setLoading(false);
            refreshSCData();            
        }
    };


    const editSCData = async (
        data: Partial<YouthCardModel> & { oldYouthid?: string; newYouthid?: string }
    ) => {
        setLoading(true);
        try {
            const updated = await editSCDataService(data);

            // Rename files only if SCID actually changed
            if (data.oldYouthid && data.newYouthid && data.oldYouthid !== data.newYouthid) {
                const result = await renameScidFiles(data.oldYouthid, data.newYouthid);
                if (result.success) {
                    console.log("Rename results:", result.results);
                } else {
                    console.error("Rename failed:", result);
                    showSnackBar("Files could not be renamed", "warning");
                }
            }

            // Update UI state
            setSCData(prev =>
                prev.map(sc => sc?.youthid === updated?.youthid ? updated : sc)
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



    const deleteSCData = async (youthid: string, id?: string) => {
        setLoading(true);
        try {
            // Run both operations
            await deleteSCDataService({ id, youthid });
            await deleteImages(youthid);

            // Update UI state only if both succeed
            setSCData(prev => prev.filter(sc => sc.youthid !== youthid));
            showSnackBar("SCData deleted successfully", "success");
            refreshSCData();
        } catch (err) {
            console.error("Error deleting SCData:", err);
            showSnackBar(`Failed to delete SCData: ${(err as Error)?.message ?? "Unknown error"}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const markAsPrinted = async (youthid: string) => {
        setLoading(true);
        try {
            // Call your service to update the SC data
            const updated = await updateSCStatus({ youthid, status: "PRINTED" });

            // Update your local state
            setSCData(prev =>
                prev.map(sc =>
                    sc.youthid === updated.youthid
                        ? { ...sc, status: updated.status } // only update status
                        : sc
                )
            );

            showSnackBar(`YID ${youthid} marked as PRINTED`, "success");
        } catch (err) {
            console.error("Error marking SC as PRINTED:", err);
            showSnackBar(
                `Failed to mark SC as PRINTED: ${(err as Error)?.message ?? "Unknown error"}`,
                "error"
            );
        } finally {            
            setLoading(false);
            refreshSCData();
        }
    };

    const revertPrintedStatus = async (youthid: string) => {
        setLoading(true);
        try {
            const updated = await updateSCStatus({ youthid, status: "ID" });

            setSCData(prev =>
                prev.map(sc =>
                    sc.youthid === updated.youthid
                        ? { ...sc, status: updated.status }
                        : sc
                )
            );

            showSnackBar(`SC ${youthid} reverted to ID`, "success");
        } catch (err) {
            console.error("Error reverting SC status:", err);
            showSnackBar(
                `Failed to revert SC status: ${(err as Error)?.message ?? "Unknown error"}`,
                "error"
            );
        } finally {            
            setLoading(false);
            refreshSCData();
        }
    };


    const fetchYouthIDMetadata = async () => {
        try {
            const res = await fetch("/api/youthid/metadata");
            const data = await res.json();
            if (data.success) setCanEditSCID(data.hasIdColumn);
        } catch (err) {
            console.error("Failed to fetch YouthID metadata:", err);
            setCanEditSCID(false);
        }
    };

    const generateNewYouthId = async () => {
        setLoading(true)
        try {
            const youthId = await generateYouthIdService()
            if (youthId) setIdNumber(youthId)
            return youthId
        } catch (err) {
            showSnackBar('Failed to generate YouthID', 'error')
            return null
        } finally {
            setLoading(false)
        }
    }



    useEffect(() => {
        fetchYouthIDMetadata();
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
                fetchYouthIDMetadata,
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
