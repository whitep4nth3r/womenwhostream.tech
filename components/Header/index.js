import Styles from "@styles/Header.module.css";

export default function Header() {
  return (
    <header className={Styles.header}>
      <h1 className={Styles.header__title}>Women Who Stream Tech</h1>
      <p className={Styles.header__subtitle}>
        Welcome to a directory of Twitch science, tech, software and game development streamers.
      </p>
    </header>
  );
}
