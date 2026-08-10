import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import {
    Code2, BookOpen, BrainCircuit, LineChart, Target, Rocket,
    ArrowRight, UserCircle, LogOut
} from 'lucide-react';
import logoIcon from '../assets/branding/logo-icon.png';
import logoText from '../assets/branding/logo-text.png';
import dashboardLaptopHero from '../assets/branding/dashboard-laptop-hero.png';
import dashboardPreview from '../assets/branding/dashboard-preview.png';

// GitHub, LinkedIn, Twitter, and Instagram aren't exported by the installed
// lucide-react version (brand icons were removed from the library) — using
// small inline SVGs for all four instead
const GithubIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.34.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.73 0c2.18-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
    </svg>
);

const LinkedinIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.15 1.45-2.15 2.94v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
);

const InstagramIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const TwitterIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const NAV_LINKS = [
    { label: 'Features', id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Why CodePulse', id: 'why-codepulse' },
    { label: 'Testimonials', id: 'testimonials' },
    { label: 'Contact', id: 'contact' },
];

const FEATURES = [
    { icon: BookOpen, title: 'Track Topics', text: 'Organize and track your DSA topics efficiently.' },
    { icon: Code2, title: 'Problem Tracker', text: 'Add, manage and track solved problems with details.' },
    { icon: BrainCircuit, title: 'AI Study Plan', text: 'Get personalized study plans based on your weak areas.' },
    { icon: LineChart, title: 'Progress Analytics', text: 'Visualize your progress with beautiful charts and insights.' },
    { icon: Target, title: 'Weak Topic Detection', text: 'Identify weak topics and focus on what matters most.' },
];

const STEPS = [
    { num: '01', title: 'Create Account', text: 'Sign up and set up your personalized dashboard.' },
    { num: '02', title: 'Add Topics & Problems', text: 'Organize topics and add problems you solve along the way.' },
    { num: '03', title: 'Track & Improve', text: 'Analyze your progress, follow AI plans and keep improving.' },
];

const LANDING_CSS = `
.cp-landing, .cp-landing * { box-sizing: border-box; }

.cp-landing {
    min-height: 100vh;
    background: #0B0620;
    color: #fff;
    font-family: inherit;
}

.cp-landing-glow {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
        radial-gradient(circle at 15% 15%, rgba(122,89,255,.14), transparent 32%),
        radial-gradient(circle at 85% 30%, rgba(88,214,255,.10), transparent 35%),
        radial-gradient(circle at 90% 90%, rgba(122,89,255,.12), transparent 32%);
}

/* Navbar */
.cp-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 48px;
    background: rgba(11,6,32,0.75);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
}

.cp-nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 19px;
    font-weight: 700;
}

.cp-nav-logo-icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    object-fit: contain;
}

.cp-nav-logo-text-img {
    height: 22px;
    width: auto;
    object-fit: contain;
}

.cp-nav-logo-text {
    font-size: 23px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: #fff;
}

.cp-nav-logo .accent { color: #9B8CFF; }

.cp-nav-links {
    display: flex;
    align-items: center;
    gap: 34px;
}

.cp-nav-links button {
    background: none;
    border: none;
    color: rgba(255,255,255,0.75);
    font-size: 14.5px;
    font-weight: 500;
    cursor: pointer;
    transition: color .2s;
    position: relative;
    padding-bottom: 3px;
}

.cp-nav-links button::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -2px;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, #7A59FF, #58D6FF);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform .25s ease;
}

.cp-nav-links button:hover { color: #fff; }
.cp-nav-links button:hover::after { transform: scaleX(1); }

.cp-nav-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.cp-nav-avatar-btn {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
}

.cp-nav-avatar-img {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    object-fit: cover;
    border: 2px solid rgba(122,89,255,0.4);
}

.cp-nav-logout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.15);
    background: transparent;
    color: rgba(255,255,255,0.75);
    cursor: pointer;
    transition: color .2s, border-color .2s, background .2s;
}
.cp-nav-logout-btn:hover {
    color: #fff;
    border-color: rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.05);
}

.cp-btn-outline {
    padding: 9px 20px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.15);
    background: transparent;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color .2s, background .2s;
}
.cp-btn-outline:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.3); }

.cp-btn-fill {
    padding: 9px 20px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(90deg, #7A59FF, #9B7BFF);
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 3px 10px rgba(122,89,255,.18);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: transform .2s, box-shadow .2s;
}
.cp-btn-fill:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(122,89,255,.24); }

/* Hero */
.cp-hero {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr;
    max-width: 1280px;
    margin: 0 auto;
    padding: 65px 6px 90px;
    min-height: 600px;
    overflow: hidden;
}

.cp-hero-text {
    max-width: 520px;
    position: relative;
    z-index: 2;
}

.cp-hero-laptop-wrap {
    position: absolute;
    top: 50%;
    right: -42px;
    transform: translateY(-50%);
    width: 850px;
}

.cp-hero-laptop-glow {
    position: absolute;
    left: 50%;
    bottom: -40px;
    transform: translateX(-50%);
    width: 70%;
    height: 90px;
    background: radial-gradient(ellipse at center, rgba(122,89,255,0.55) 0%, rgba(88,214,255,0.25) 45%, transparent 75%);
    filter: blur(30px);
    z-index: 0;
    pointer-events: none;
}

.cp-hero-laptop-img {
    position: relative;
    z-index: 1;
    width: 98%;
    max-width: none;
    height: auto;
    display: block;
}

.cp-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(122,89,255,0.12);
    border: 1px solid rgba(122,89,255,0.3);
    color: #C4B5FF;
    font-size: 12.5px;
    font-weight: 600;
    margin-bottom: 20px;
}
.cp-hero-badge::before {
    content: "";
    width: 6px; height: 6px;
    border-radius: 999px;
    background: #7A59FF;
}

.cp-hero h1 {
    font-size: clamp(2.2rem, 3.6vw, 3.4rem);
    line-height: 1.08;
    font-weight: 750;
    letter-spacing: -0.02em;
    margin: 0 0 18px;
}

.cp-hero h1 .accent {
    background: linear-gradient(90deg, #9B7BFF, #58D6FF);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.cp-hero p {
    color: rgba(255,255,255,0.65);
    font-size: 15.5px;
    line-height: 1.65;
    max-width: 440px;
    margin: 0 0 30px;
}

.cp-hero-actions {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 34px;
}

.cp-hero-actions .cp-btn-fill,
.cp-hero-actions .cp-btn-outline {
    padding: 13px 24px;
    font-size: 15px;
}

.cp-hero-social {
    display: flex;
    align-items: center;
    gap: 12px;
}

.cp-avatar-stack {
    display: flex;
}
.cp-avatar-stack span {
    width: 34px; height: 34px;
    border-radius: 999px;
    border: 2px solid #0B0620;
    margin-left: -10px;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
}
.cp-avatar-stack span:first-child { margin-left: 0; }

.cp-hero-social-text {
    font-size: 13px;
    color: rgba(255,255,255,0.6);
    line-height: 1.4;
}
.cp-hero-social-text strong { color: #fff; }

/* Dashboard preview image */
.cp-dashboard-preview {
    position: relative;
    width: 100%;
    overflow: visible;
    display: flex;
    justify-content: flex-end;
}

.cp-dashboard-preview-img {
    border-radius: 24px;
}

.cp-dashboard-preview-img {
    width: 700px;                
    max-width: none;
    height: auto;
    display: block;
}
/* Feature cards */
.cp-features-wrapper {
    position: relative; 
    z-index: 1;
    max-width: 1300px; margin: 0 auto;
    padding: -5px 48px 90px;
    scroll-margin-top: 100px;
}

.cp-features {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    padding: 30px 15px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
}

.cp-feature-tile {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 28px 22px;
    min-height: 220px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    transition: transform .2s, border-color .2s, background .2s;
}

.cp-feature-tile:hover {
    transform: translateY(-4px);
    border-color: rgba(122,89,255,0.4);
    background: rgba(255,255,255,0.05);
}
    
.cp-feature-tile .icon-box {
    width: 42px; height: 42px; border-radius: 11px;
    background: rgba(122,89,255,0.15);
    display: grid; place-items: center; margin-bottom: 16px;
}
.cp-feature-tile h3 { margin: 0 0 6px; font-size: 15.5px; font-weight: 700; }
.cp-feature-tile p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.5; }

/* How it works */
.cp-hiw {
    position: relative; z-index: 1;
    max-width: 1100px; margin: 0 auto;
    padding: 55px 48px 90px;
    text-align: center;
     scroll-margin-top: 100px;
}
.cp-hiw-title {
    display: inline-flex; align-items: center; gap: 14px;
    font-size: 19px; font-weight: 700; letter-spacing: 0.08em;
    color: #C4B5FF; text-transform: uppercase;
    margin-bottom: 50px;
}
.cp-hiw-title::before, .cp-hiw-title::after {
    content: ""; width: 40px; height: 1px; background: rgba(122,89,255,0.4);
}
.cp-hiw-steps {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 70px; position: relative;
}
    
.cp-hiw-step {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 40px 28px 30px;
    position: relative;
    transition: transform .2s, border-color .2s, background .2s;
}

.cp-hiw-step:hover {
    transform: translateY(-4px);
    border-color: rgba(122,89,255,0.4);
    background: rgba(255,255,255,0.05);
}

.cp-hiw-step:not(:last-child)::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 100%;
    width: 70px;
    height: 2px;
    background-image: linear-gradient(90deg, rgba(122,89,255,0.6) 0 6px, transparent 6px 12px);
    background-size: 12px 2px;
    background-repeat: repeat-x;
}

.cp-hiw-num {
    width: 40px; height: 40px; border-radius: 999px;
    background: linear-gradient(145deg, #7A59FF, #58D6FF);
    display: grid; place-items: center;
    font-size: 14px; font-weight: 700;
    position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
    box-shadow: 0 8px 20px rgba(122,89,255,.4);
}
.cp-hiw-step h3 { margin: 0 0 8px; font-size: 15.5px; font-weight: 700; }
.cp-hiw-step p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.5; }

/* Why CodePulse split */
.cp-why {
    position: relative; z-index: 1;
    max-width: 1280px; margin: 0 48px 90px; margin-inline: auto;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    padding: 30px 40px;  
    display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 44px; align-items: center;
     scroll-margin-top: 100px;
}
.cp-why-eyebrow { color: #9B7BFF; font-size: 12.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 14px; }
.cp-why h2 { font-size: clamp(1.6rem, 2.4vw, 2.2rem); font-weight: 750; margin: 0 0 16px; line-height: 1.2; }
.cp-why p { color: rgba(255,255,255,0.6); font-size: 14.5px; line-height: 1.7; margin: 0 0 26px; max-width: 440px; }

/* CTA banner */
.cp-cta {
    position: relative; z-index: 1;
    max-width: 1280px; margin: 0 auto;
    padding: 0 48px 60px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
}
.cp-cta-inner {
    position: relative;
    overflow: hidden;
    background: linear-gradient(120deg, rgba(122,89,255,0.16), rgba(88,214,255,0.08));
    border: 1px solid rgba(122,89,255,0.25);
    border-radius: 24px;
    padding: 44px 52px;
    display: flex; align-items: center; justify-content: space-between; gap: 24px;
    flex-wrap: wrap;
    box-shadow: 0 15px 40px rgba(122,89,255,0.06), inset 0 1px 0 rgba(255,255,255,0.05);
    transition: border-color .3s, box-shadow .3s;
}

.cp-cta-inner:hover {
    border-color: rgba(122,89,255,0.4);
    box-shadow: 0 20px 50px rgba(122,89,255,0.1), inset 0 1px 0 rgba(255,255,255,0.06);
}

.cp-cta-inner::before {
    content: "";
    position: absolute;
    top: -60%;
    right: -10%;
    width: 380px;
    height: 380px;
    background: radial-gradient(circle, rgba(122,89,255,0.12), transparent 70%);
    pointer-events: none;
}

.cp-cta-left { display: flex; align-items: center; gap: 20px; }
.cp-cta-icon {
    width: 60px; height: 60px; border-radius: 18px;
    background: linear-gradient(145deg, #7A59FF, #58D6FF);
    display: grid; place-items: center; flex-shrink: 0;
    box-shadow: 0 10px 24px rgba(122,89,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25);
    position: relative;
    z-index: 1;
}
.cp-cta h3 { margin: 0 0 6px; font-size: 21px; font-weight: 750; }
.cp-cta p { margin: 0; font-size: 13.5px; color: rgba(255,255,255,0.6); max-width: 420px; }
.cp-cta-right { text-align: center; }
.cp-cta-right small { display: block; margin-top: 8px; color: rgba(255,255,255,0.45); font-size: 11.5px; }

/* Footer */
.cp-footer {
    position: relative; z-index: 1;
    border-top: 1px solid rgba(255,255,255,0.07);
    padding: 32px 48px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 16px;
}
.cp-footer-links { display: flex; gap: 26px; }
.cp-footer-links button {
    background: none; border: none; color: rgba(255,255,255,0.55);
    font-size: 13.5px; cursor: pointer; transition: color .2s;
}
.cp-footer-links button:hover { color: #fff; }
.cp-footer-social { display: flex; gap: 14px; }
.cp-footer-social a {
    width: 34px; height: 34px; border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.1);
    display: grid; place-items: center;
    color: rgba(255,255,255,0.6);
    transition: color .2s, border-color .2s;
}
.cp-footer-social a:hover { color: #fff; border-color: rgba(255,255,255,0.3); }

@media (max-width: 1024px) {
    .cp-nav-links { display: none; }
    .cp-hero { min-height: auto; }
    .cp-hero-text { max-width: 100%; }
    .cp-hero-laptop-img {
        position: static;
        transform: none;
        width: 100%;
        margin-top: 30px;
    }
    .cp-features { grid-template-columns: repeat(2, 1fr); }
    .cp-hiw-steps { grid-template-columns: 1fr; }
    .cp-why { grid-template-columns: 1fr; padding: 36px; }
}
@media (max-width: 640px) {
    .cp-nav { padding: 14px 20px; }
    .cp-hero { padding: 40px 20px 60px; }
    .cp-features-wrapper { padding: 0 20px 60px; }
    .cp-features { grid-template-columns: 1fr; padding: 30px 20px; }
    .cp-hiw { padding: 0 20px 60px; }
    .cp-why { margin: 0 20px 60px; }
    .cp-cta { padding: 0 20px; }
    .cp-footer { padding: 24px 20px; flex-direction: column; }
}
`;

const DashboardMockup = () => (
    <div className="cp-dashboard-preview">
        <img src={dashboardPreview} alt="CodePulse Dashboard Preview" className="cp-dashboard-preview-img" />
    </div>
);

const Landing = () => {
    const navigate = useNavigate();
    const { token, user, logout } = useAuth();
    const [imgError, setImgError] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const scrollTo = (id) => {
        if (id === 'contact') {
            navigate('/help');
            return;
        }
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="cp-landing">
            <style>{LANDING_CSS}</style>
            <div className="cp-landing-glow" />
            {/* Navbar */}
            <nav className="cp-nav">
                <div className="cp-nav-logo">
                    <img src={logoIcon} alt="" className="cp-nav-logo-icon" />
                    <span className="cp-nav-logo-text">Code<span className="accent">Pulse</span></span>
                </div>
                <div className="cp-nav-links">
                    {NAV_LINKS.map((l) => (
                        <button key={l.id} onClick={() => scrollTo(l.id)}>{l.label}</button>
                    ))}
                </div>
                <div className="cp-nav-actions">
                    {token ? (
                        <>
                            <button className="cp-nav-avatar-btn" onClick={() => navigate('/profile')} title="Go to Profile">
                                {user?.photo && !imgError ? (
                                    <img
                                        src={user.photo}
                                        alt="Profile"
                                        onError={() => setImgError(true)}
                                        className="cp-nav-avatar-img"
                                    />
                                ) : (
                                    <UserCircle size={38} color="rgba(255,255,255,0.8)" />
                                )}
                            </button>
                            <button className="cp-nav-logout-btn" onClick={handleLogout} title="Log out">
                                <LogOut size={16} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="cp-btn-outline" onClick={() => navigate('/login')}>Log In</button>
                            <button className="cp-btn-fill" onClick={() => navigate('/register')}>Get Started</button>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <section className="cp-hero" id="hero">
                <div className="cp-hero-text">
                    <span className="cp-hero-badge">Your DSA Journey, Organized</span>
                    <h1>
                        Track. Analyze.<br />
                        <span className="accent">Improve. Repeat.</span>
                    </h1>
                    <p>
                        CodePulse is your all-in-one DSA progress tracker. Organize topics, track problems,
                        analyze performance, and get AI-powered study plans to stay ahead.
                    </p>
                    <div className="cp-hero-actions">
                        <button className="cp-btn-fill" onClick={() => navigate(token ? '/dashboard' : '/register')}>
                            Get Started for Free <ArrowRight size={16} />
                        </button>
                        <button className="cp-btn-outline" onClick={() => scrollTo('features')}>
                            Explore Features
                        </button>
                    </div>
                    <div className="cp-hero-social">
                        <div className="cp-avatar-stack">
                            <span style={{ background: '#7A59FF' }}>A</span>
                            <span style={{ background: '#58D6FF' }}>R</span>
                            <span style={{ background: '#FF6B81' }}>K</span>
                            <span style={{ background: '#4ADE80' }}>S</span>
                        </div>
                        <p className="cp-hero-social-text">
                        <strong>Join 1000+ students</strong><br />who are improving every day
                    </p>
                </div>
                </div>
                <div className="cp-hero-laptop-wrap">
                    <div className="cp-hero-laptop-glow" />
                        <img src={dashboardLaptopHero} alt="CodePulse Dashboard" className="cp-hero-laptop-img" />
                    </div>
            </section>

            {/* Features */}
            <section className="cp-features-wrapper" id="features">
                <div className="cp-features">
                    {FEATURES.map((f) => (
                    <div key={f.title} className="cp-feature-tile">
                        <div className="icon-box"><f.icon size={20} color="#B3A2FF" /></div>
                            <h3>{f.title}</h3>
                            <p>{f.text}</p>
                        </div>
                    ))}
                </div>  
            </section>

            {/* How It Works */}
            <section className="cp-hiw" id="how-it-works">
                <div className="cp-hiw-title">How It Works</div>
                <div className="cp-hiw-steps">
                    {STEPS.map((s) => (
                        <div key={s.num} className="cp-hiw-step">
                            <div className="cp-hiw-num">{s.num}</div>
                            <h3>{s.title}</h3>
                            <p>{s.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why CodePulse */}
            <section className="cp-why" id="why-codepulse">
                <div>
                    <p className="cp-why-eyebrow">Powerful Dashboard</p>
                    <h2>Everything you need,<br />in one place.</h2>
                    <p>
                        From tracking progress to identifying weak areas and getting AI-recommendations,
                        CodePulse helps you stay consistent and interview-ready.
                    </p>
                    <button className="cp-btn-fill" onClick={() => navigate(token ? '/dashboard' : '/login')}>
                        Explore Dashboard <ArrowRight size={16} />
                    </button>
                </div>
                <DashboardMockup />
            </section>

            {/* Testimonials placeholder anchor (content optional, kept as section for nav scroll target) */}
            <div id="testimonials" />

            {/* CTA banner */}
            <section className="cp-cta">
                <div className="cp-cta-inner">
                    <div className="cp-cta-left">
                        <div className="cp-cta-icon"><Rocket size={24} /></div>
                        <div>
                            <h3>Ready to Start Your DSA Journey?</h3>
                            <p>Join thousands of students who are tracking, analyzing and improving every day with CodePulse.</p>
                        </div>
                    </div>
                    <div className="cp-cta-right">
                        <button className="cp-btn-fill" onClick={() => navigate(token ? '/dashboard' : '/register')}>
                            Get Started for Free <ArrowRight size={16} />
                        </button>
                        <small>No credit card required</small>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;