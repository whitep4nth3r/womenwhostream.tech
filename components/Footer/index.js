import Styles from "@styles/Footer.module.css";

export default function Footer() {
  const date = new Date();
  return (
    <footer className={Styles.footer}>
      &copy; whitep4nth3r {date.getFullYear()} | Made with ❤️ by{" "}
      <a href="https://discord.gg/GQbXUVCneJ" target="_blank">
        The Claw
      </a>
    </footer>
  );
}
