import Head from "next/head";
import ContentfulApi from "@ctfl/api";
import StreamersGrid from "@components/StreamersGrid";
import MainLayout from "@components/MainLayout";

export default function Tag({ streamers, tag, tags }) {
  return (
    <>
      <Head>
        <title>{tag.name} | Women Who Stream Tech</title>
        <meta
          name="description"
          content={`You are viewing ${tag.name} streamers. Women Who Stream Tech is a directory of Twitch tech streamers who identify as women.`}
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400&family=Source+Sans+Pro:ital,wght@0,400;1,400&display=swap"
          rel="stylesheet"
        />
      </Head>
      <main>
        <MainLayout tags={tags} selectedTag={tag}>
          <StreamersGrid streamers={streamers} />
        </MainLayout>
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
  const tags = await ContentfulApi.getAllTags();

  return {
    props: {
      streamers,
      tag,
      tags,
    },
    revalidate: 1,
  };
}
