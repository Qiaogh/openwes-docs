// @ts-check
import {Config} from '@docusaurus/types';

const config: Config = {
    title: 'OpenWes Docs',
    tagline: 'Open Source Warehouse Execution System',
    url: 'https://docs.openwes.top', // Change this to your actual domain
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',

    organizationName: 'openwes', // Change to your GitHub org/user
    projectName: 'openwes-docs', // Change to your repo name
    deploymentBranch: 'gh-pages',

    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'zh'],
        localeConfigs: {
            en: {label: 'English'},
            zh: {label: '中文'}
        },
    },

    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve('./sidebars.ts'),
                    editUrl: 'https://github.com/jingsewu/openwes-docs/edit/main/',
                }
            }),
        ],
    ],

    themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            navbar: {
                title: 'OpenWes Docs',
                logo: {
                    alt: 'OpenWes Logo',
                    src: 'img/logo.svg',
                },
                items: [
                    {to: '/docs/started/introduction', label: 'Docs', position: 'left'},
                    {to: '/blog', label: 'Blog', position: 'left'},
                    {
                        type: 'localeDropdown',
                        position: 'right',
                    },
                    {
                        href: 'https://openwes.top/',
                        label: 'Home',
                        position: 'right',
                    },
                    {
                        href: 'https://github.com/jingsewu/open-wes',
                        label: 'GitHub',
                        position: 'right',
                    },
                ],
            },
            footer: {
                style: 'dark',
                links: [
                    {
                        title: 'Docs',
                        items: [
                            {label: 'Introduction', to: '/docs/started/introduction'},
                        ],
                    },
                    {
                        title: 'Community',
                        items: [
                            {label: 'GitHub', href: 'https://github.com/jingsewu/open-wes'},
                        ],
                    },
                ],
                copyright: `Copyright © ${new Date().getFullYear()} OpenWes. Built with Docusaurus.`,
            },
            prism: {
                theme: require('prism-react-renderer').themes.github, // or themes.nightOwl
            },
        }),
};

export default config;
