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
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400&family=Source+Sans+Pro:ital,wght@0,400;1,400&display=swap"
          rel="stylesheet"
        />
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
