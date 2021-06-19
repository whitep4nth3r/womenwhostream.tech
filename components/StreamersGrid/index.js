import Link from "next/link";
import Image from "next/image";
import GitHub from "./svg/github";
import Twitter from "./svg/twitter";
import Twitch from "./svg/twitch";
import YouTube from "./svg/youtube";
import ExternalLink from "./svg/externallink";
import Styles from "./StreamersGrid.module.css";

function constructImage(isLive, streamData, twitchData, vodData) {
  if (isLive) {
    return (
      <Image
        src={streamData.thumbnail_url.replace("{width}", "1920").replace("{height}", "1080")}
        alt={`${twitchData.display_name} on Twitch`}
        height="225"
        width="400"
        layout="responsive"
      />
    );
  } else if (vodData) {
    return (
      <Image
        src={vodData.thumbnail_url.replace("%{width}", "1920").replace("%{height}", "1080")}
        alt={`${twitchData.display_name} on Twitch`}
        height="225"
        width="400"
        layout="responsive"
      />
    );
  } else if (twitchData.offline_image_url) {
    return (
      <Image
        src={twitchData.offline_image_url}
        alt={`${twitchData.display_name} on Twitch`}
        height="225"
        width="400"
        layout="responsive"
      />
    );
  } else {
    return (
      <Image
        src={twitchData.profile_image_url}
        alt={`${twitchData.display_name} on Twitch`}
        height="300"
        width="300"
        layout="responsive"
      />
    );
  }
}

export default function Streamers({ streamers }) {
  return (
    <div className={Styles.cardGrid}>
      {streamers.map((streamer) => {
        const isLive = streamer.streamData.length === 1;
        const streamData = isLive ? streamer.streamData[0] : [];
        const twitchData = streamer.twitchData[0];
        const vodData = streamer.vodData[0];

        return (
          <div key={streamer.sys.id} className={Styles.card}>
            <div className={Styles.card__imageHolder}>
              {constructImage(isLive, streamData, twitchData, vodData)}

              {isLive && (
                <>
                  <p className={Styles.card__live}>
                    <span>LIVE</span>
                  </p>
                  <p className={Styles.card__streamTitle}>{streamData.title}</p>
                  <h2 className={Styles.card__streamViewers}>{streamData.viewer_count} viewers</h2>
                </>
              )}
            </div>
            <div className={Styles.card__inner}>
              <a
                href={`https://twitch.tv/${streamer.twitchUsername}`}
                target="_blank"
                rel="nofollow noopener"
                title={`Follow ${streamer.twitchUsername} on Twitch`}
                className={Styles.card__twitchLink}>
                <div className={Styles.card__twitchLink__icon}>
                  <Image
                    src={twitchData.profile_image_url}
                    alt={`${streamer.twitchUsername} on Twitch`}
                    height="100"
                    width="100"
                    layout="responsive"
                    className="border-2 border-gray-900 rounded-full"
                  />
                  <span className={Styles.card__twitchLink__svg}>
                    <Twitch />
                  </span>
                </div>
                <span>{streamer.twitchUsername}</span>
              </a>
              <div className={Styles.card__tags}>
                {streamer.tagsCollection.items.map((tag) => (
                  <Link href={`/${tag.slug}`} key={tag.sys.id}>
                    <a className={Styles.card__tag}>{tag.name}</a>
                  </Link>
                ))}
              </div>
              <div className={Styles.card__socials}>
                {streamer.twitterUsername && (
                  <a
                    href={`https://twitter.com/${streamer.twitterUsername}`}
                    target="_blank"
                    aria-label={`${streamer.twitterUsername} on Twitter`}
                    rel="nofollow noopener"
                    className={Styles.card__socials__link}>
                    <Twitter />
                  </a>
                )}
                {streamer.githubUsername && (
                  <a
                    href={`https://github.com/${streamer.githubUsername}`}
                    target="_blank"
                    aria-label={`${streamer.githubUsername} on GitHub`}
                    rel="nofollow noopener"
                    className={Styles.card__socials__link}>
                    <GitHub />
                  </a>
                )}
                {streamer.youtubeChannelId && (
                  <a
                    href={`https://youtube.com/c/${streamer.youtubeChannelId}`}
                    target="_blank"
                    aria-label={`${streamer.twitchUsername} on YouTube`}
                    rel="nofollow noopener"
                    className={Styles.card__socials__link}>
                    <YouTube />
                  </a>
                )}
                {streamer.websiteUrl && (
                  <a
                    href={streamer.websiteUrl}
                    target="_blank"
                    rel="nofollow noopener"
                    title={`Visit ${streamer.twitchUsername}'s website`}
                    className={Styles.card__socials__link}>
                    <ExternalLink />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
