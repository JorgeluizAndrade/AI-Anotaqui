import { NextResponse } from "next/server";

const backendBaseUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

type Context = {
  params: {
    id: string;
  };
};

export async function GET(_: Request, context: Context) {
  try {
    const response = await fetch(`${backendBaseUrl}/api/annotations/${encodeURIComponent(context.params.id)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Não foi possível carregar a anotação selecionada." },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Falha ao conectar com o backend para detalhe da anotação." },
      { status: 502 },
    );
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const body = await request.json();

    const response = await fetch(`${backendBaseUrl}/api/annotations/${encodeURIComponent(context.params.id)}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Não foi possível atualizar a anotação." },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Falha ao conectar com o backend para salvar a anotação." },
      { status: 502 },
    );
  }
}
