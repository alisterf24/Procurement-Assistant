import { NextResponse } from "next/server";
import { discoverSuppliers } from "@/lib/supplier-discovery";
import { defaultRequirement } from "@/lib/scoring";
import type { LaptopRequirement } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<{
      requirement: Partial<LaptopRequirement>;
    }>;
    const requirement = {
      ...defaultRequirement,
      ...body.requirement
    } satisfies LaptopRequirement;

    return NextResponse.json(await discoverSuppliers(requirement));
  } catch {
    return NextResponse.json(
      { error: "Supplier discovery failed." },
      { status: 500 }
    );
  }
}
