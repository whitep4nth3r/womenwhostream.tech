module.exports = {
  siteUrl: "https://womenwhostream.tech",
  generateRobotsTxt: true,
  exclude: ["/server-sitemap.xml"],
  robotsTxtOptions: {
    additionalSitemaps: ["https://womenwhostream.tech/server-sitemap.xml"],
  },
};
