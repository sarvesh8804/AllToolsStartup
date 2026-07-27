"use client";

import { LENGTH_UNITS } from "@/lib/convert/units";
import { UnitConverterPanel } from "@/tools/unit-converter-panel";

export function LengthConverterTool() {
  return (
    <UnitConverterPanel
      kind="linear"
      toolSlug="length-converter"
      units={LENGTH_UNITS}
      defaultFrom="m"
      sample="1"
    />
  );
}
