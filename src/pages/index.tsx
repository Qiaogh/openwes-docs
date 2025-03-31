import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css'; // Create a CSS module for custom styles

import Translate from '@docusaurus/Translate';

export default function Home() {
    return (
        <Layout
            title="Welcome to OpenWES"
            description="Your open warehouse execution system."
        >
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        <Translate>Welcome to OpenWES</Translate>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        <Translate>
                            Your open-source warehouse execution system designed for efficiency and scalability.
                        </Translate>
                    </p>
                    <div className={styles.heroButtons}>
                        <Link
                            className="button button--primary button--lg"
                            to={useBaseUrl('docs/started/introduction')}
                        >
                            <Translate>Get Started</Translate>
                        </Link>
                        <Link
                            className="button button--secondary button--lg"
                            to={useBaseUrl('docs/api/authentication')}
                        >
                            <Translate>API Reference</Translate>
                        </Link>
                    </div>
                </div>
            </div>

            <div className={styles.features}>
                <div className={styles.feature}>
                    <h2>
                        <Translate>Modular Architecture</Translate>
                    </h2>
                    <p>
                        <Translate>
                            OpenWES is built with a modular design, allowing you to customize and extend its
                            functionality to fit your needs.
                        </Translate>
                    </p>
                </div>
                <div className={styles.feature}>
                    <h2>
                        <Translate>Scalable & Efficient</Translate>
                    </h2>
                    <p>
                        <Translate>
                            Designed to handle warehouses of all sizes, OpenWES ensures optimal performance and resource
                            utilization.
                        </Translate>
                    </p>
                </div>
                <div className={styles.feature}>
                    <h2>
                        <Translate>Open Source</Translate>
                    </h2>
                    <p>
                        <Translate>
                            OpenWES is fully open-source, giving you the freedom to modify, distribute, and contribute
                            to the project.
                        </Translate>
                    </p>
                </div>
            </div>

            <div className={styles.cta}>
                <h2>
                    <Translate>Ready to Get Started?</Translate>
                </h2>
                <p>
                    <Translate>
                        Explore our documentation to learn how to set up and use OpenWES in your warehouse.
                    </Translate>
                </p>
                <Link
                    className="button button--primary button--lg"
                    to={useBaseUrl('docs/started/introduction')}
                >
                    <Translate>View Documentation</Translate>
                </Link>
            </div>
        </Layout>
    );
}
