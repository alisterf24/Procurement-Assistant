"use client";

import { useEffect, useState } from "react";
import { defaultRequirement } from "@/lib/scoring";
import type { LaptopRequirement, RFQDraft, SupplierRecommendation } from "@/lib/types";

type DemoState = {
  requirement: LaptopRequirement;
  recommendations: SupplierRecommendation[];
  selectedSupplierIds: string[];
  rfqDraft: RFQDraft | null;
};

const STORAGE_KEY = "mm-sourcing-demo-state";
const WORKFLOW_STORAGE_KEYS = [
  STORAGE_KEY,
  "mm-laptop-requirement",
  "mm-selected-laptop-suppliers",
  "mm-rfq-sent-log"
];

const initialState: DemoState = {
  requirement: defaultRequirement,
  recommendations: [],
  selectedSupplierIds: [],
  rfqDraft: null
};

export function clearWorkflowStorage() {
  WORKFLOW_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
}

export function useDemoState() {
  const [state, setState] = useState<DemoState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = parseStoredState(stored);

      if (parsed) {
        setState({
          ...initialState,
          ...parsed,
          requirement: {
            ...defaultRequirement,
            ...parsed.requirement
          }
        });
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      const hasActiveWorkflow =
        Boolean(localStorage.getItem("mm-laptop-requirement")) ||
        state.recommendations.length > 0 ||
        state.selectedSupplierIds.length > 0 ||
        state.rfqDraft !== null;

      if (hasActiveWorkflow) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    }
  }, [hydrated, state]);

  return {
    ...state,
    hydrated,
    setRequirement: (requirement: LaptopRequirement) =>
      setState((current) => ({ ...current, requirement })),
    setRecommendations: (recommendations: SupplierRecommendation[]) =>
      setState((current) => ({ ...current, recommendations })),
    setSelectedSupplierIds: (selectedSupplierIds: string[]) =>
      setState((current) => ({ ...current, selectedSupplierIds })),
    setRfqDraft: (rfqDraft: RFQDraft) =>
      setState((current) => ({ ...current, rfqDraft })),
    resetDemo: () => {
      setState(initialState);
      clearWorkflowStorage();
    }
  };
}

function parseStoredState(value: string): DemoState | null {
  try {
    const parsed = JSON.parse(value) as Partial<DemoState>;

    return {
      requirement: {
        ...defaultRequirement,
        ...parsed.requirement
      },
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
      selectedSupplierIds: Array.isArray(parsed.selectedSupplierIds)
        ? parsed.selectedSupplierIds.filter((supplierId) => typeof supplierId === "string")
        : [],
      rfqDraft: parsed.rfqDraft ?? null
    };
  } catch {
    clearWorkflowStorage();
    return null;
  }
}
