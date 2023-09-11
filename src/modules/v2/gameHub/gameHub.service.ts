import { GameHubProducts } from "@prisma-api-v2/client"
import { db } from "@/utils"

export async function getGameHubProducts(
  sort: keyof GameHubProducts = "id",
  sortOrder: "asc" | "desc" = "asc",
  limit = 100,
  page = 1
) {
  const [data, meta] = await db.gameHubProducts
    .paginate({
      orderBy: {
        [sort]: sortOrder
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getGameHubProduct(id: string) {
  const [data, meta] = await db.gameHubProducts
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}
