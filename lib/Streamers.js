import fs from "fs";

export default class Streamers {
  static async getAll() {
    const streamers = await fs.readFileSync("./scripts/data/streamers.json", "utf8");

    return JSON.parse(streamers);
  }

  static async getByTag(tagSlug) {
    const streamers = await Streamers.getAll();

    const filtered = streamers.filter((streamer) => {
      const tagSlugs = streamer.tagsCollection.items.map((tag) => tag.slug);
      return tagSlugs.includes(tagSlug);
    });

    return filtered;
  }
}
