import Contentful from "@lib/Contentful";
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
        <MainLayout>
          <StreamersGrid streamers={streamers} />
        </MainLayout>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const streamers = await Contentful.getAllStreamers();

  return {
    props: {
      streamers,
    },
    revalidate: 1,
  };
}
