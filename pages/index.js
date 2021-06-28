import Contentful from "@lib/Contentful";
import Streamers from "@lib/Streamers";
import StreamersGrid from "@components/StreamersGrid";
import MainLayout from "@components/MainLayout";
import { NextSeo } from "next-seo";

export default function Index({ streamers, tags }) {
  return (
    <>
      <NextSeo
        title="Home"
        description={`Women Who Stream Tech is a directory of Twitch tech streamers who identify as women.`}
      />

      <main>
        <MainLayout tags={tags}>
          <StreamersGrid streamers={streamers} />
        </MainLayout>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const streamers = await Streamers.getAll();
  const tags = await Contentful.getTags();

  return {
    props: {
      streamers,
      tags,
    },
    revalidate: 60,
  };
}
