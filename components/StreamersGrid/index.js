import Link from "next/link";

export default function Streamers({ streamers }) {
  return (
    <div>
      {streamers.map((streamers) => (
        <div key={streamers.sys.id}>
          <div>{streamers.githubUsername}</div>
          <div>{streamers.twitchUsername}</div>
          <div>{streamers.twitterUsername}</div>
          <div>{streamers.youtubeChannelId}</div>
          <div>{streamers.websiteUrl}</div>
          <div>{streamers.location}</div>
          {streamers.tagsCollection.items.map((tag) => (
            <Link href={`/${tag.slug}`} key={tag.sys.id}>
              <a style={{ color: "red", marginRight: "1rem" }}>{tag.name}</a>
            </Link>
          ))}
          <br />
          <br />
          <br />
        </div>
      ))}
    </div>
  );
}
