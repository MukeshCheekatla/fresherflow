/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://fresherflow.in',
    generateRobotsTxt: true,
    sitemapSize: 7000,
    exclude: [
        '/api/*',
        '/admin/*',
        '/dashboard/*',
        '/auth/*',
        '/profile/*',
    ],
    robotsTxtOptions: {
        additionalSitemaps: [
            'https://fresherflow.in/sitemap.xml',
        ],
    },
};
