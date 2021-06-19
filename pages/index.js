import Head from "next/head";
import ContentfulApi from "@ctfl/api";
import StreamersGrid from "@components/StreamersGrid";
import Header from "@components/Header";
import ContentWrapper from "@components/ContentWrapper";

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
      <Header />
      <main>
        <ContentWrapper>
          <StreamersGrid streamers={streamers} />
        </ContentWrapper>
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
    revalidate: 1,
  };
}
