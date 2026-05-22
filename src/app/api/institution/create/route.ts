import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const institution = await prisma.institution.create({
    data: body,
  });

  return Response.json(institution);
}