import { getServerSideSitemap } from "next-sitemap";
import Streamers from "@lib/Streamers";

export const getServerSideProps = async (ctx) => {
  // Method to source urls from cms
  // const urls = await fetch('https//example.com/api')

  const tags = await Streamers.getTags();

  const tagFields = tags.map((tag) => {
    return {
      loc: `https://womenwhostream.tech/${tag.slug}`,
      lastmod: new Date().toISOString(),
    };
  });

  return getServerSideSitemap(ctx, tagFields);
};

// Default export to prevent next.js errors
export default () => {};
