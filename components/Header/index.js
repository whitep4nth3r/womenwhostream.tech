import Styles from "@styles/Header.module.css";

export default function Header({ onlineCount }) {
  return (
    <header className={Styles.header}>
      <h1 className={Styles.header__title}>Women Who Stream Tech</h1>
      <p className={Styles.header__subtitle}>
        Welcome to a directory of Twitch science, tech, software and game development streamers.
      </p>
      <h2 className={Styles.header__liveCount}>{onlineCount} streamers live</h2>
      <p className={Styles.header__subtitleBottom}>
        This site is really broken. If you'd like to help fix it, join{" "}
        <a className={Styles.header__subtitleLink} target="_blank" href="https://discord.gg/theclaw">
          The Claw Discord
        </a>{" "}
        and say hello.
      </p>
    </header>
  );
}
