"use client";

import { DATA_STORAGE_UNITS } from "@/lib/convert/units";
import { UnitConverterPanel } from "@/tools/unit-converter-panel";

export function DataStorageConverterTool() {
  return (
    <UnitConverterPanel
      kind="linear"
      toolSlug="data-storage-converter"
      units={DATA_STORAGE_UNITS}
      defaultFrom="MB"
      sample="1"
      rejectNegative
    />
  );
}
