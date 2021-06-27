import fs from "fs";
import fetch from "node-fetch";

const currentJsonInBranch = 'https://raw.githubusercontent.com/whitep4nth3r/womenwhostream.tech/stream-data/scripts/data/streamers.json';

export default class Streamers {
  static async getAll() {
    const response = await fetch(currentJsonInBranch);
    const responseJson = await response.json();

    return responseJson;
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
