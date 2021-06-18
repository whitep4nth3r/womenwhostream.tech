import Head from "next/head";
import ContentfulApi from "@ctfl/api";
import StreamersGrid from "@components/StreamersGrid";

export default function Index({ streamers }) {
  return (
    <>
      <Head>
        <title>Women Who Stream Tech</title>
        <meta
          name="description"
          content="Women Who Stream Tech is a directory of Twitch tech streamers who identify as women."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <StreamersGrid streamers={streamers} />
      </main>
    </>
  );
}

export async function getStaticProps() {
  const streamers = await ContentfulApi.getAllStreamers();

  return {
    props: {
      streamers,
    },
  };
}
