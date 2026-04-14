import { NextResponse } from "next/server";

const backendBaseUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const response = await fetch(`${backendBaseUrl}/api/file`, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Falha ao conectar com o backend de uploads." },
      { status: 502 },
    );
  }
}
