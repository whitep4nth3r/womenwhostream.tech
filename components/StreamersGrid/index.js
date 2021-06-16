import Link from "next/link";
import GitHub from "./svg/github";
import Twitter from "./svg/twitter";
import Twitch from "./svg/twitch";
import YouTube from "./svg/youtube";
import ExternalLink from "./svg/externallink";
import Styles from "./StreamersGrid.module.css";

export default function Streamers({ streamers }) {
  return (
    <div className={Styles.cardGrid}>
      {streamers.map((streamer) => (
        <div key={streamer.sys.id} className={Styles.card}>
          <img src="http://placekitten.com/1920/1080" className="w-full" />

          <div className={Styles.card__inner}>
            <a
              href={`https://twitch.tv/${streamer.twitchUsername}`}
              target="_blank"
              aria-label={`Follow ${streamer.twitchUsername} on Twitch`}
              rel="nofollow noopener"
              className={Styles.card__twitchLink}>
              <span className={Styles.card__twitchLink__icon}>
                <img
                  src="http://placekitten.com/70/70"
                  className="border-2 border-gray-900 rounded-full"
                />
                <span className={Styles.card__twitchLink__svg}>
                  <Twitch />
                </span>
              </span>
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
              <a
                href={`https://twitter.com/${streamer.twitterUsername}`}
                target="_blank"
                aria-label={`${streamer.twitterUsername} on Twitter`}
                rel="nofollow noopener"
                className={Styles.card__socials__link}>
                <Twitter />
              </a>
              <a
                href={`https://github.com/${streamer.githubUsername}`}
                target="_blank"
                aria-label={`${streamer.githubUsername} on GitHub`}
                rel="nofollow noopener"
                className={Styles.card__socials__link}>
                <GitHub />
              </a>
              <a
                href={`https://youtube.com/c/${streamer.youtubeChannelId}`}
                target="_blank"
                aria-label={`${streamer.twitchUsername} on YouTube`}
                rel="nofollow noopener"
                className={Styles.card__socials__link}>
                <YouTube />
              </a>

              <a
                href={streamer.websiteUrl}
                target="_blank"
                rel="nofollow noopener"
                aria-label={`Visit ${streamer.twitchUsername}'s website`}
                className={Styles.card__socials__link}>
                <ExternalLink />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
