import { auth } from "@server/auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = (request: NextRequest) => auth.handler(request);
export const POST = (request: NextRequest) => auth.handler(request);
export const PUT = (request: NextRequest) => auth.handler(request);
export const DELETE = (request: NextRequest) => auth.handler(request);
