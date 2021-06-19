import Styles from "./ContentWrapper.module.css";

export default function ContentWrapper({ children }) {
  return <section className={Styles.wrapper}>{children}</section>;
}
