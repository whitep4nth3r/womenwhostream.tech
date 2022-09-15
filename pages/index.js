import Contentful from "@lib/Contentful";
import StreamersGrid from "@components/StreamersGrid";
import Footer from "@components/Footer";
import Header from "@components/Header";
import { NextSeo } from "next-seo";

export default function Index({ onlineStreamers, offlineStreamers, totalStreamersCount }) {
  return (
    <>
      <NextSeo
        title="Home"
        description={`Women Who Stream Tech is a directory of Twitch science, tech, software and game development streamers.`}
      />
      <Header onlineCount={onlineStreamers.length} total={totalStreamersCount} />
      <main>
        <StreamersGrid streamers={[...onlineStreamers, ...offlineStreamers]} />
      </main>
      <Footer />
    </>
  );
}

export async function getServerSideProps() {
  const onlineStreamers = await Contentful.getOnlineStreamers();
  const offlineStreamers = await Contentful.getOfflineStreamers();

  const totalStreamersCount = onlineStreamers.length + offlineStreamers.length;

  return {
    props: {
      onlineStreamers,
      offlineStreamers,
      totalStreamersCount,
    },
  };
}
