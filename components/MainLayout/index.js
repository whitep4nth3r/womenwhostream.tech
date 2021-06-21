import Link from "next/link";
import Styles from "./MainLayout.module.css";

export default function MainLayout({ tags, children, selectedTag }) {
  const date = new Date();
  return (
    <div className={Styles.mainLayout}>
      <header className={Styles.mainLayout__header}>
        <Link href="/">
          <a className={Styles.mainLayout__header__link}>
            <h1 className={Styles.mainLayout__header__title}>Women Who Stream Tech</h1>
          </a>
        </Link>
        {/* <ol className={Styles.mainLayout__links}>
          <li className={Styles.mainLayout__links__item}>
            <Link href="/about">
              <a className={Styles.mainLayout__links__itemLink}>About</a>
            </Link>
          </li>
          <li className={Styles.mainLayout__links__item}>
            <Link href="/nominate">
              <a className={Styles.mainLayout__links__itemLink}>Nominate</a>
            </Link>
          </li>
        </ol> */}
        <ul className={Styles.mainLayout__tags}>
          <li>
            <Link href="/">
              <a className={Styles.mainLayout__tags__tag}>All</a>
            </Link>
          </li>
          {tags.map((tag) => {
            const isSelected = selectedTag ? selectedTag.slug === tag.slug : false;
            const classNames = isSelected
              ? `${Styles.mainLayout__tags__tag} ${Styles.mainLayout__tags__tag__selected}`
              : Styles.mainLayout__tags__tag;
            return (
              <li key={tag.slug}>
                <Link href={`/${tag.slug}`}>
                  <a className={classNames}>{tag.name}</a>
                </Link>
              </li>
            );
          })}
        </ul>
      </header>

      <div className={Styles.mainLayout__body}>
        {children}
        <p className={Styles.mainLayout__copyright}>
          &copy; {date.getFullYear()} womenwhostream.tech
        </p>
      </div>
    </div>
  );
}
