import Head from "next/head";
import ContentfulApi from "@ctfl/api";
import StreamersGrid from "@components/StreamersGrid";
import Header from "@components/Header";
import ContentWrapper from "@components/ContentWrapper";

export default function Tag({ streamers, tag }) {
  return (
    <>
      <Head>
        <title>{tag.name} | Women Who Stream Tech</title>
        <meta
          name="description"
          content={`You are viewing ${tag.name} streamers. Women Who Stream Tech is a directory of Twitch tech streamers who identify as women.`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header tag={tag.name} />
      <main>
        <ContentWrapper>
          <StreamersGrid streamers={streamers} />
        </ContentWrapper>
      </main>
    </>
  );
}

export async function getStaticPaths() {
  const tags = await ContentfulApi.getAllTags();

  const paths = tags.map((tag) => {
    return { params: { tag: tag.slug } };
  });

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const streamers = await ContentfulApi.getStreamersByTag(params.tag);
  const tag = await ContentfulApi.getTagBySlug(params.tag);

  return {
    props: {
      streamers,
      tag,
    },
    revalidate: 1,
  };
}
