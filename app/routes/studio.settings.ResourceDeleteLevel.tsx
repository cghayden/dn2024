import { json, type ActionFunctionArgs } from "@remix-run/node";
import { requireStudioUserId } from "~/models/studio.server";
import { prisma } from "~/db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireStudioUserId(request);
  const body = await request.formData();
  const levelId = body.get("levelId");
  const levelType = body.get("levelType");

  if (
    !levelId ||
    !levelType ||
    typeof levelId !== "string" ||
    typeof levelId !== "string"
  ) {
    throw new Error("incorrect, or no levelId/skillLevel provided");
  }

  if (levelType === "skillLevel") {
    await prisma.skillLevel.delete({
      where: {
        id: levelId,
      },
    });
    return "level deleted";
  }

  if (levelType === "ageLevel") {
    await prisma.ageLevel.delete({
      where: {
        id: levelId,
      },
    });
    return "level deleted";
  }
};
