import Head from "next/head";
import Streamers from "@lib/Streamers";
import StreamersGrid from "@components/StreamersGrid";
import MainLayout from "@components/MainLayout";

export default function Index({ streamers, tags }) {
  return (
    <>
      <Head>
        <title>Women Who Stream Tech</title>
        <meta
          name="description"
          content="Women Who Stream Tech is a directory of Twitch tech streamers who identify as women."
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400&family=Source+Sans+Pro:ital,wght@0,400;1,400&display=swap"
          rel="stylesheet"
        />
      </Head>

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
  const tags = await Streamers.getTags();

  return {
    props: {
      streamers,
      tags,
    },
    revalidate: 1,
  };
}
