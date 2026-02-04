/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://fresherflow.in',
    generateIndexSitemap: false,
    generateRobotsTxt: true,
    sitemapSize: 7000,
    exclude: [
        '/api',
        '/api/*',
        '/admin',
        '/admin/*',
        '/dashboard',
        '/dashboard/*',
        '/auth',
        '/auth/*',
        '/account',
        '/account/*',
        '/profile',
        '/profile/*',
        '/login',
        '/register',
    ],
};
