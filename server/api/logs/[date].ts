import fs from "fs/promises";
import path from "path";

const CACHE_DIR = path.resolve(".cache");
const EXTERNAL_API = "http://ip:port/logs";

export default defineEventHandler(async (event) => {
  const { date } = getRouterParams(event);

  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid date format (YYYY-MM-DD)",
    });
  }

  const cacheFile = path.join(CACHE_DIR, `${date}.log`);

  try {
    await fs.access(cacheFile);
    const cached = await fs.readFile(cacheFile, "utf-8");
    console.log(`Serving cached logs for ${date}`);
    return cached;
  } catch (cacheError) {
    console.log(`Cache miss for ${date}, fetching from external API`);
    try {
      const data = await $fetch<string>(`${EXTERNAL_API}/${date}`);
      await fs.mkdir(CACHE_DIR, { recursive: true });
      await fs.writeFile(cacheFile, data, "utf-8");
      console.log(`Cached logs for ${date}`);
      return data;
    } catch (fetchError) {
      console.error(`Failed to fetch logs for ${date}:`, fetchError);
      throw createError({
        statusCode: 502,
        statusMessage: "Failed to fetch logs from external service",
      });
    }
  }
});
