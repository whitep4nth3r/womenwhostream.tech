import fs from "fs";
import fetch from "node-fetch";

const currentJson = `https://api.contentful.com/spaces/${process.env.CTFL_JSON_SPACE_ID}/environments/main/entries/${process.env.CTFL_JSON_ENTRY_ID}`;

export default class Streamers {
  static async getAll() {
    const response = await fetch(currentJson, {
      headers: {
        Authorization: `Bearer ${process.env.CTFL_JSON_PREVIEW_TOKEN}`
      },
    });
    const responseJson = await response.json();

    return responseJson.fields.data['en-US'];
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
