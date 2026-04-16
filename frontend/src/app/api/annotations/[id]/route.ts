import { NextResponse } from "next/server";

const backendBaseUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

type Context = {
  params: {
    id: string;
  };
};

export async function GET(_: Request, context: Context) {
  const params = await context.params;
  try {
    const response = await fetch(`${backendBaseUrl}/api/annotations/${encodeURIComponent(params.id)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Nao foi possivel carregar a anotacao selecionada." },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Falha ao conectar com o backend para detalhe da anotacao." },
      { status: 502 },
    );
  }
}

export async function PATCH(request: Request, context: Context) {
  const params = await context.params;
  try {
    const body = await request.json();

    const response = await fetch(`${backendBaseUrl}/api/annotations/${encodeURIComponent(params.id)}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Nao foi possivel atualizar a anotacao." },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Falha ao conectar com o backend para salvar a anotacao." },
      { status: 502 },
    );
  }
}

export async function DELETE(_: Request, context: Context) {
  const params = await context.params;
  try {
    const response = await fetch(`${backendBaseUrl}/api/annotations/${encodeURIComponent(params.id)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Nao foi possivel excluir a anotacao." },
        { status: response.status },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { message: "Falha ao conectar com o backend para excluir a anotacao." },
      { status: 502 },
    );
  }
}
