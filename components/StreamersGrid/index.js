// import Link from "next/link";
import GitHub from "./svg/github";
import Twitter from "./svg/twitter";
import YouTube from "./svg/youtube";
import ExternalLink from "./svg/externallink";
import Styles from "@styles/StreamersGrid.module.css";

function getVodThreshold(broadcasterType, date) {
  const oneDay = 86400000;

  switch (broadcasterType) {
    case "partner":
      return date + oneDay * 60;
    case "affiliate":
      return date + oneDay * 14;
    default:
      return date + oneDay * 14;
  }
}

function constructImage(isLive, streamData, twitchData, vodData) {
  const broadcasterType = twitchData.broadcaster_type;

  const vodCreated_timestamp = Date.parse(vodData?.created_at) || null;
  const vodCreated_date = new Date(vodCreated_timestamp).getTime();
  const latestDateVodAvailable = getVodThreshold(broadcasterType, vodCreated_date);

  const now = new Date();
  const now_timestamp = now.getTime();
  const thumbnailAvailable = latestDateVodAvailable > now_timestamp;

  if (isLive) {
    return (
      <img
        src={streamData.thumbnail_url.replace("{width}", "400").replace("{height}", "225")}
        alt={`${twitchData.display_name} on Twitch`}
        height="225"
        width="400"
      />
    );
  } else if (vodData !== null && thumbnailAvailable) {
    return (
      <img
        src={vodData.thumbnail_url.replace("%{width}", "400").replace("%{height}", "225")}
        alt={`${twitchData.display_name} on Twitch`}
        height="225"
        width="400"
      />
    );
  } else if (twitchData.offline_image_url) {
    return (
      <img src={twitchData.offline_image_url} alt={`${twitchData.display_name} on Twitch`} height="225" width="400" />
    );
  } else {
    return (
      <img src={twitchData.profile_image_url} alt={`${twitchData.display_name} on Twitch`} height="300" width="300" />
    );
  }
}

export default function Streamers({ streamers }) {
  return (
    <div className={Styles.cardGrid}>
      {streamers.map((streamer) => {
        if (streamer.twitchData) {
          const { isLive, vodData, twitchData, streamData } = streamer;

          return (
            <div key={streamer.sys.id} className={Styles.card}>
              <div className={Styles.card__imageHolder}>
                {constructImage(isLive, streamData, twitchData, vodData)}
                {isLive && (
                  <p className={Styles.card__live}>
                    <span>LIVE</span>
                  </p>
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
                    />
                  </div>
                  <span>{streamer.twitchUsername}</span>
                </a>
                {isLive && <p className={Styles.card__streamTitle}>LIVE: {streamData.title}</p>}
                <p className={Styles.card__bio}>{twitchData.description}</p>
                {isLive && (
                  <div className={Styles.card__tags}>
                    {streamer.tagData && streamer.tagData.map
                      ? streamer.tagData.map((tag) => (
                          <span key={tag.localization_names["en-us"]} className={Styles.card__tag}>
                            {tag.localization_names["en-us"]}
                          </span>
                        ))
                      : null}
                  </div>
                )}
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
        } else {
          return null;
        }
      })}
    </div>
  );
}
