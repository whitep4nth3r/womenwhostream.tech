export default {
  titleTemplate: "%s | Women Who Stream Tech",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://womenwhostream.tech",
    site_name: "Women Who Stream Tech",
  },
  twitter: {
    handle: "@whitep4nth3r",
    site: "https://womenwhostream.tech",
    cardType: "summary_large_image",
  },
  additionalMetaTags: [
    {
      name: "msapplication-TileColor",
      content: "#603cba",
    },
    {
      name: "theme-color",
      content: "#ffffff",
    },
  ],
  additionalLinkTags: [
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
    },
    {
      rel: "stylesheet",
      href:
        "https://fonts.googleapis.com/css2?family=Sora:wght@400&family=Source+Sans+Pro:ital,wght@0,400;1,400&display=swap",
    },
    {
      rel: "manifest",
      href: "/site.webmanifest",
    },
    {
      rel: "icon",
      href: "/favicon.ico",
    },
    {
      rel: "mask-icon",
      href: "/safari-pinned-tab.svg",
      color: "#0f111a",
    },
    {
      rel: "icon",
      href: "/favicon-16x16.png",
      sizes: "16x16",
      type: "image/png",
    },
    {
      rel: "icon",
      href: "/favicon-32x32.png",
      sizes: "32x32",
      type: "image/png",
    },
    {
      rel: "apple-touch-icon",
      href: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  ],
};
