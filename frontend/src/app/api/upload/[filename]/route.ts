import { NextResponse } from "next/server";

const backendBaseUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

type Context = {
  params: {
    filename: string;
  };
};

export async function GET(_: Request, context: Context) {
  const params = await context.params;
  try {
    const response = await fetch(
      `${backendBaseUrl}/api/file/${encodeURIComponent(params.filename)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json({ message: "Arquivo nao encontrado." }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Falha ao conectar com o backend para consultar status." },
      { status: 502 },
    );
  }
}
