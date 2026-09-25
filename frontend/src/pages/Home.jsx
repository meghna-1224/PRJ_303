function Home() {
    return (
        <main className="home-page">

            <section className="hero-section">
                <div className="hero-content">

                    <p className="hero-label">
                        PUNJAB GOVERNMENT EMPLOYMENT SERVICES
                    </p>

                    <h1>
                        Find Employment Opportunities
                        <br />
                        That Match Your Skills
                    </h1>

                    <p className="hero-description">
                        Explore employment opportunities, manage your
                        applications and build your professional profile
                        through the PGRKAM employment portal.
                    </p>

                    <div className="hero-actions">
                        <a href="/jobs" className="primary-button">
                            Explore Jobs
                        </a>

                        <a href="/register" className="secondary-button">
                            Create Account
                        </a>
                    </div>

                </div>
            </section>

            <section className="services-section">

                <div className="section-heading">
                    <p>EMPLOYMENT SERVICES</p>
                    <h2>Everything you need in one place</h2>
                </div>

                <div className="service-grid">

                    <div className="service-card">
                        <h3>Find Jobs</h3>
                        <p>
                            Search and explore available employment
                            opportunities based on your interests and skills.
                        </p>
                    </div>

                    <div className="service-card">
                        <h3>Build Your Profile</h3>
                        <p>
                            Maintain your education, skills, experience
                            and employment preferences.
                        </p>
                    </div>

                    <div className="service-card">
                        <h3>Track Applications</h3>
                        <p>
                            Keep track of the opportunities you have
                            applied for and their application status.
                        </p>
                    </div>

                </div>

            </section>

        </main>
    );
}

export default Home;