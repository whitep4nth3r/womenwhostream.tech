import Contentful from "@lib/Contentful";
import StreamersGrid from "@components/StreamersGrid";
import { NextSeo } from "next-seo";
import Link from "next/link";

export default function Index({ onlineStreamers, offlineStreamers }) {
  function filterStreamers() {}

  return (
    <>
      <NextSeo
        title="Home"
        description={`Women Who Stream Tech is a directory of Twitch tech streamers who identify as women.`}
      />

      <header>
        <Link href="/">
          <a aria-label="View all Women Who Stream Tech">
            <h1>Women Who Stream Tech</h1>
          </a>
        </Link>
      </header>

      <main>
        <h2>Online</h2>
        <StreamersGrid streamers={onlineStreamers} />
        <h2>Offline</h2>
        <StreamersGrid streamers={offlineStreamers} />
      </main>

      <footer>FOOTER HERE</footer>
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
