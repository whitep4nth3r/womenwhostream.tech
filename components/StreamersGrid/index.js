import Link from "next/link";
import GitHub from "./svg/github";
import Twitter from "./svg/twitter";
import YouTube from "./svg/youtube";
import ExternalLink from "./svg/externallink";
import Styles from "./StreamersGrid.module.css";
import ContentWrapper from "@components/ContentWrapper";

function constructImage(isLive, streamData, twitchData, vodData) {
  if (isLive) {
    return (
      <img
        src={streamData.thumbnail_url.replace("{width}", "336").replace("{height}", "189")}
        alt={`${twitchData.display_name} on Twitch`}
        height="225"
        width="400"
      />
    );
  } else if (vodData !== null) {
    return (
      <img
        src={vodData.thumbnail_url.replace("%{width}", "336").replace("%{height}", "189")}
        alt={`${twitchData.display_name} on Twitch`}
        height="225"
        width="400"
      />
    );
  } else if (twitchData.offline_image_url) {
    return (
      <img
        src={twitchData.offline_image_url}
        alt={`${twitchData.display_name} on Twitch`}
        height="225"
        width="400"
      />
    );
  } else {
    return (
      <img
        src={twitchData.profile_image_url}
        alt={`${twitchData.display_name} on Twitch`}
        height="300"
        width="300"
      />
    );
  }
}

export default function Streamers({ streamers }) {
  return (
    <ContentWrapper>
      <div className={Styles.cardGrid}>
        {streamers.map((streamer) => {
          const { vodData, twitchData, streamData } = streamer;
          const isLive = streamData !== null;

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
                    <h2 className={Styles.card__streamViewers}>
                      {streamData.viewer_count} viewers
                    </h2>
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
                  <div className={Styles.card__twitchLink__profileImg}>
                    <img
                      src={twitchData.profile_image_url}
                      alt={`${streamer.twitchUsername} on Twitch`}
                      height="70"
                      width="70"
                      className="border-2 border-gray-900 rounded-full"
                    />
                  </div>
                  <span>{streamer.twitchUsername}</span>
                </a>
                <p className={Styles.card__bio}>{twitchData.description}</p>
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
    </ContentWrapper>
  );
}
