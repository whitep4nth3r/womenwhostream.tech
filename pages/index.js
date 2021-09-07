import Contentful from "@lib/Contentful";
import StreamersGrid from "@components/StreamersGrid";
import MainLayout from "@components/MainLayout";
import { NextSeo } from "next-seo";

export default function Index({ onlineStreamers, offlineStreamers }) {
  return (
    <>
      <NextSeo
        title="Home"
        description={`Women Who Stream Tech is a directory of Twitch tech streamers who identify as women.`}
      />

      <main>
        <MainLayout>
          <StreamersGrid streamers={onlineStreamers} />
          <StreamersGrid streamers={offlineStreamers} />
        </MainLayout>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const onlineStreamers = await Contentful.getOnlineStreamers();
  const offlineStreamers = await Contentful.getOfflineStreamers();

  return {
    props: {
      onlineStreamers,
      offlineStreamers,
    },
    revalidate: 1,
  };
}
