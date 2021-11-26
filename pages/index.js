import Contentful from "@lib/Contentful";
import StreamersGrid from "@components/StreamersGrid";
import Footer from "@components/Footer";
import Header from "@components/Header";
import { NextSeo } from "next-seo";

export default function Index({ onlineStreamers, offlineStreamers }) {
  return (
    <>
      <NextSeo
        title="Home"
        description={`Women Who Stream Tech is a directory of Twitch science, tech, software and game development streamers.`}
      />
      <Header />
      <main>
        <StreamersGrid streamers={[...onlineStreamers, ...offlineStreamers]} />
      </main>
      <Footer />
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
