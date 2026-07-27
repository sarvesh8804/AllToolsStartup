"use client";

import { WEIGHT_UNITS } from "@/lib/convert/units";
import { UnitConverterPanel } from "@/tools/unit-converter-panel";

export function WeightConverterTool() {
  return (
    <UnitConverterPanel
      kind="linear"
      toolSlug="weight-converter"
      units={WEIGHT_UNITS}
      defaultFrom="kg"
      sample="1"
    />
  );
}
