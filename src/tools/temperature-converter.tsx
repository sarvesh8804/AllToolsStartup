"use client";

import { TEMP_UNITS } from "@/lib/convert/units";
import { UnitConverterPanel } from "@/tools/unit-converter-panel";

export function TemperatureConverterTool() {
  return (
    <UnitConverterPanel
      kind="temperature"
      toolSlug="temperature-converter"
      units={TEMP_UNITS}
      defaultFrom="c"
      sample="0"
    />
  );
}
