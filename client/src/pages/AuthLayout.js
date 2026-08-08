import {
    BarChart3,
    BrainCircuit,
    Sun,
    Moon,
    ArrowLeft
} from 'lucide-react';

import logoIcon from '../assets/branding/logo-icon.png';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const BOTTOM_FEATURES = [
    {
        icon: BarChart3,
        title: 'Track Problems',
        text: 'Keep a log of all the problems you solve.',
        color: '#57D8FF',
        bg: 'rgba(87, 216, 255, 0.14)'
    },
    {
        icon: BrainCircuit,
        title: 'AI Study Plans',
        text: 'Get personalized plans based on your weak topics.',
        color: '#7A59FF',
        bg: 'rgba(122, 89, 255, 0.16)'
    },
];

const DailyGoalsCard = () => (
    <div className="cp-goal-card">
        <div className="cp-goal-title">
            🎯 Daily Goals
        </div>
        <h2>5/day</h2>
        <div className="cp-progress">
            <div className="cp-progress-fill" />
        </div>
        <span>3/5 completed</span>
    </div>
);

const AUTH_LAYOUT_CSS = `
.codepulse-auth-shell,
.codepulse-auth-shell * {
    box-sizing: border-box;
}

.codepulse-auth-shell{
    min-height:100vh;
    width:100%;
    position:relative;
    overflow:hidden;
    isolation:isolate;
    background:
        radial-gradient(circle at 18% 18%, rgba(88,214,255,.08), transparent 30%),
        radial-gradient(circle at 72% 78%, rgba(122,89,255,.10), transparent 34%),
        linear-gradient(
            135deg,
            #141032 0%,
            #1B1647 30%,
            #251B5B 62%,
            #312276 100%
        );
}

.codepulse-auth-shell::after {
    content: "";
    pointer-events: none;
    position: absolute;
    inset: 0;
    z-index: 60;
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-radius: 18px;
    box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.35),
        0 18px 55px rgba(15, 23, 42, 0.14);
}

/* LEFT BLUE HERO */
.codepulse-auth-hero {
    position: absolute;
    inset: 0 auto 0 0;
    width: 63%;
    overflow: hidden;
    z-index: 1;
    display: flex;
    flex-direction: column;
}

.codepulse-auth-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0.10;
    background-image: radial-gradient(circle, rgba(255,255,255,.65) 1px, transparent 1px);
    background-size:36px 36px;
    -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 58%, transparent 92%);
    mask-image: linear-gradient(90deg, #000 0%, #000 58%, transparent 92%);
}

.codepulse-auth-hero::after{
    content:"";
    position:absolute;
    inset:0;
    pointer-events:none;
    background:
    radial-gradient(
        circle at 25% 20%,
        rgba(88,214,255,.12),
        transparent 34%
    ),
    radial-gradient(
        circle at 75% 78%,
        rgba(122,89,255,.10),
        transparent 40%
    );
}

.cp-hero-copy {
    position: relative;
    z-index: 8;
    padding: 32px 43px 0;
    max-width: 460px;
}

.cp-brand-lockup {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 37px;
}

.cp-brand-icon {
    width: 52px;
    height: 52px;
    border-radius: 13px;
    display: grid;
    place-items: center;
    background: linear-gradient(145deg, #0B5ED7, #0A4FB8);
    box-shadow: 0 12px 28px rgba(11, 94, 215, 0.35);
    padding: 0px;
}

.cp-brand-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.cp-brand-name{
    font-size:28px;
    font-weight:550;
    letter-spacing:-0.03em;
    color:#fff;
}

.cp-hero-title {
    margin: 0;
    color: #FFFFFF;
    font-size: clamp(1.9rem, 2.9vw, 2.9rem);
    line-height: 1.08;
    letter-spacing: -0.040em;
    font-weight: 610;
}

.cp-hero-title .accent {
    display: inline-block;
    background:linear-gradient( 90deg, #58D6FF 0%, #78B9FF 45%, #7A59FF 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.cp-title-underline {
    width: 52px;
    height: 4px;
    border-radius: 999px;
    margin: 30px 0 18px;
    background: linear-gradient(90deg, #58D6FF, #7A59FF);
}

.cp-hero-subtitle {
    margin: 0;
    max-width: 360px;
    color: rgba(255,255,255,0.72);
    font-size: 17.3px;
    line-height: 1.55;
    font-weight: 500;
}

/* Reserved space that spans the FULL hero width, so the floating card can
   sit out in the blank area to the right of the text column */
.cp-hero-scene {
    position: relative;
    z-index: 8;
    width: 100%;
    height: 210px;
    margin-top: 8px;
}

/* Bottom feature cards */
.cp-feature-grid {
    position: relative;
    z-index: 8;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 0 20% 49px 47px;  
    max-width: 1000px; 
    margin-top: auto;
}

.cp-feature-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 22px 18px;
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    justify-content: center; /* ya flex-start */
    min-height: 130px; /* dono cards ka fixed baseline height */
}

.cp-feature-icon {
    width: 36px;
    height: 36px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    margin-bottom: 10px;
}

.cp-feature-underline {
    width: 22px;
    height: 2.5px;
    border-radius: 999px;
    background: linear-gradient(90deg, #58D6FF, #7A59FF);
    margin-bottom: 7px;
}

.cp-feature-title {
    margin: 0 0 3px;
    color: rgba(255,255,255,0.95);
    font-size: 14px;
    line-height: 1.2;
    font-weight: 650;
}

.cp-feature-text {
    margin: 0;
    color: rgba(255,255,255,0.62);
    font-size: 11.5px;
    line-height: 1.4;
    font-weight: 500;
}

/* RIGHT WHITE PANEL */
.codepulse-auth-panel {
    position: relative;
    z-index: 20;
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    background: #FDFEFF;
    padding: 4.5rem 1.75rem 3rem;
}

.cp-auth-content {
    position: relative;
    z-index: 3;
    width: 100%;
    max-width: 410px;
    margin: 0 auto;
}

.cp-theme-toggle {
    position: absolute;
    z-index: 5;
    top: 24px;
    right: 30px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 0;
    background: transparent;
    color: #0F172A;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
}

.cp-back-btn {
    position: absolute;
    z-index: 5;
    top: -35px;
    left: -40px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 0;
    background: transparent;
    color: #0F172A;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
}

.cp-back-btn svg {
    width: 14px;
    height: 14px;
}

@media (max-width: 640px) {
    .cp-back-btn {
        left: 20px;
        top: 20px;
    }
}

.cp-theme-toggle svg {
    width: 14px;
    height: 14px;
}

.codepulse-curve-node {
    display: none;
}

.cp-center-divider {
    pointer-events: none;
    position: absolute;
    inset-inline: 0;
    top: 50%;
    height: 1px;
    z-index: 55;
    background: rgba(255,255,255,0.88);
    box-shadow: 0 0 18px rgba(255,255,255,0.65);
}

@media (min-width: 1024px) {
    .codepulse-auth-panel {
        width: 48%;
        margin-left: auto;
        padding:
            2rem
            clamp(3rem, 4.8vw, 5.2rem)
            3rem
            clamp(6.4rem, 9.4vw, 9.8rem);
        border-top-left-radius: 48% 100%;
        border-bottom-left-radius: 48% 100%;
        border-left:1px solid rgba(88,214,255,.18);
        box-shadow:
            -16px 0 50px rgba(88,214,255,.08),
            -1px 0 0 rgba(255,255,255,.92);
    }

    .codepulse-curve-node {
        display: block;
        position: absolute;
        left: 0;
        top: 33%;
        width: 15px;
        height: 15px;
        transform: translate(-50%, -50%);
        border-radius: 999px;
        border: 2px solid rgba(87, 216, 255, 0.95);
        background: #FDFEFF;
        box-shadow:
            0 0 0 7px rgba(88,214,255,.10),
            0 0 18px rgba(88,214,255,.45);
    }
}

/* Floating Daily Goals card — sits inside the reserved .cp-hero-scene band,
   pushed toward the right blank space, subtler tilt than before */
.cp-goal-card{
    position:absolute;
    right:24%;
    top:-140%;
    transform: translateY(-50%) perspective(1000px) rotateY(-20deg);
    width:258px;
    padding:20px;
    height: 185px;
    border-radius:20px;
    background:rgba(32,22,73,.48);
    backdrop-filter:blur(18px);
    -webkit-backdrop-filter:blur(18px);
    border:1px solid rgba(255,255,255,.10);
    transform-style:preserve-3d;
    z-index:6;
    box-shadow:
        0 30px 60px rgba(0,0,0,.40),
        0 0 45px rgba(122,89,255,.22),
        inset 0 1px 0 rgba(255,255,255,.10);
    transition: transform .35s ease;
}

.cp-goal-card::before{
    content:"";
    position:absolute;
    inset:-22px;
    border-radius:24px;
    background:
        radial-gradient(
            circle,
            rgba(122,89,255,.24),
            transparent 72%
        );
    filter:blur(22px);
    z-index:-2;
}

.cp-goal-card::after{
    content:"";
    position:absolute;
    inset:-10px;
    border-radius:22px;
    border:1px solid rgba(255,255,255,.05);
    opacity:.55;
    z-index:-2;
}

.cp-goal-title{
    color:#CFC9FF;
    font-size:13px;
    font-weight:600;
}

.cp-goal-card h2{
    margin:12px 0;
    color:white;
    font-size:38px;
    font-weight:700;
}

.cp-progress{
    height:9px;
    border-radius:999px;
    overflow:hidden;
    background:rgba(255,255,255,.12);
}

.cp-progress-fill{
    width:68%;
    height:100%;
    border-radius:999px;
    background:linear-gradient(
        90deg,
        #58D6FF,
        #7A59FF
    );
}

.cp-goal-card span{
    display:block;
    margin-top:10px;
    color:rgba(255,255,255,.72);
    font-size:12px;
}

.cp-goal-card:hover{
    transform: translateY(-50%) perspective(1000px) rotateY(-3deg) translateX(-4px);
}

@media (max-width: 1180px) and (min-width: 1024px) {
    .cp-hero-copy {
        padding: 22px 38px 0;
    }

    .cp-brand-lockup {
        margin-bottom: 16px;
    }

    .cp-hero-title {
        font-size: 1.9rem;
    }

    .cp-hero-subtitle {
        font-size: 11.5px;
        max-width: 300px;
    }

    .cp-hero-scene {
        height: 170px;
    }

    .cp-goal-card {
        right: 6%;
        width: 200px;
        transform: translateY(-50%) perspective(1000px) rotateY(-8deg) scale(0.85);
    }

    .cp-feature-grid {
        display: none;
    }

    .codepulse-auth-panel {
        width: 47.5%;
        padding-left: clamp(5.8rem, 9vw, 7rem);
        padding-right: clamp(2.4rem, 4vw, 4rem);
    }
}

@media (max-width: 1023px) {
    .codepulse-auth-shell{
        background:
        radial-gradient(circle at 35% 60%, rgba(88,214,255,.08), transparent 45%),
        linear-gradient( 135deg, #141032, #1B1647, #251B5B, #312276);
    }
    .codepulse-auth-hero {
        width: 63%;   /* left side */
    }

    .codepulse-auth-shell::after {
        border-radius: 0;
    }

    .cp-center-divider {
        display: none;
    }
}

@media (max-width: 640px) {
    .codepulse-auth-panel {
        width: 48%;   /* right side */
        margin-left: auto;
        padding-inline: 1.25rem;
    }

    .cp-theme-toggle {
        right: 20px;
        top: 20px;
    }
}
`;

const AuthIllustration = () => (
    <aside className="codepulse-auth-hero" aria-hidden="true">
        <div className="cp-hero-copy">
            <div className="cp-brand-lockup">
                <div className="cp-brand-icon">
                    <img src={logoIcon} alt="" />
                </div>
                <span className="cp-brand-name">CodePulse</span>
            </div>

            <h1 className="cp-hero-title">
                Track. Improve.
                <br />
                Crack <span className="accent">Placements.</span>
            </h1>

            <div className="cp-title-underline" />

            <p className="cp-hero-subtitle">
                Stay consistent, track your progress, and achieve your placement goals with CodePulse.
            </p>
        </div>

        <div className="cp-hero-scene">
            <DailyGoalsCard />
        </div>

        <div className="cp-feature-grid">
            {BOTTOM_FEATURES.map((f) => (
                <div key={f.title} className="cp-feature-card">
                    <div className="cp-feature-icon" style={{ backgroundColor: f.bg }}>
                        <f.icon size={17} strokeWidth={2.35} color={f.color} />
                    </div>
                    <div className="cp-feature-underline" />
                    <p className="cp-feature-title">{f.title}</p>
                    <p className="cp-feature-text">{f.text}</p>
                </div>
            ))}
        </div>
    </aside>
);

const AuthLayout = ({
    children,
    showCenterDivider = false
}) => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    return (
        <div className="codepulse-auth-shell">
            <style>{AUTH_LAYOUT_CSS}</style>
            {showCenterDivider && <div className="cp-center-divider" />}
            <AuthIllustration />
            <main className="codepulse-auth-panel">
                <div className="codepulse-curve-node" aria-hidden="true" />
                    <button type="button" onClick={toggleTheme} className="cp-theme-toggle">
                        {theme === 'dark' ? <Sun /> : <Moon />}
                        {theme === 'dark' ? 'Light' : 'Dark'}
                    </button>
                <div className="cp-auth-content">
                    <button type="button" onClick={() => navigate('/')} className="cp-back-btn">
                        <ArrowLeft /> Back
                    </button>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AuthLayout;