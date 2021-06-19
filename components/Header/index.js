import Styles from "./Header.module.css";
import Link from "next/link";

export default function Header({ tag }) {
  const suffix = tag ? ` | ${tag}` : "";
  return (
    <header className={Styles.header}>
      <Link href="/">
        <a className={Styles.header__link}>
          <h1 className={Styles.header__title}>Women Who Stream Tech{suffix}</h1>
        </a>
      </Link>
    </header>
  );
}
