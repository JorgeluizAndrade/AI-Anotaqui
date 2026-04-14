import { NextResponse } from "next/server";

const backendBaseUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

export async function GET() {
  try {
    const response = await fetch(`${backendBaseUrl}/api/annotations`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Não foi possível carregar anotações no backend." },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Falha ao conectar com o backend de anotações." },
      { status: 502 },
    );
  }
}
