import {
    AlarmClock,
    BarChart3,
    BrainCircuit,
    CheckCircle2,
    Code2,
    Quote,
    Sun,
    Target
} from 'lucide-react';

import logoIcon from '../assets/branding/logo-icon.png';
import laptopImage from '../assets/branding/laptop-preview.png';

const HERO_FEATURES = [
    {
        icon: BarChart3,
        title: 'Track Problems',
        text: 'Keep a log of solved problems.',
        color: '#57D8FF',
        bg: 'rgba(87, 216, 255, 0.14)'
    },
    {
        icon: Target,
        title: 'Daily Goals',
        text: 'Set goals and stay on track.',
        color: '#22C55E',
        bg: 'rgba(34, 197, 94, 0.13)'
    },
    {
        icon: BrainCircuit,
        title: 'AI Study Plans',
        text: 'Personalized plans based on your weak topics.',
        color: '#57D8FF',
        bg: 'rgba(87, 216, 255, 0.12)'
    },
];

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
    position: absolute;
    z-index: 8;
    top: clamp(28px, 5.5vh, 54px);
    left: 43px;
    max-width: 390px;
}

.cp-brand-lockup {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 52px;
    align-items: center;
}

.cp-brand-icon {
    width: 60px;
    height: 60px;
    border-radius: 14px;
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
    font-size:32px;
    font-weight:550;
    letter-spacing:-0.03em;
    color:#fff;
}

.cp-hero-title {
    margin: 0;
    color: #FFFFFF;
    font-size: clamp(2.15rem, 3.35vw, 3.35rem);
    line-height: 0.98;
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

.cp-hero-subtitle {
    margin: 34px;
    max-width: 560px;
    color: rgba(255,255,255,0.78);
    font-size: 13px;
    line-height: 1.65;
    font-weight: 600;
}

.cp-feature-list {
    margin-top: 130px;
    display: grid;
    gap: 20px;
}

.cp-feature-row {
    display: flex;
    align-items: center;
    gap: 15px;
}

.cp-feature-icon {
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,0.10);
    box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.10),
        0 12px 24px rgba(0,0,0,0.20);
}

.cp-feature-title {
    margin: 0;
    color: rgba(255,255,255,0.95);
    font-size: 18px;
    line-height: 1.15;
    font-weight: 650;
}

.cp-feature-text {
    margin: 3px 0 0;
    color: rgba(255,255,255,0.72);
    font-size: 12px;
    line-height: 1.35;
    font-weight: 500;
}

.cp-hero-quote {
    position: absolute;
    z-index: 9;
    left:50%;
    transform:translateX(-5%);
    bottom: 58px;
    width: 300px;
    min-height: 85px;
    border-radius: 12px;
    padding: 17px 23px;
    display: flex;
    align-items: flex-start;
    gap: 9px;
    color: #FFFFFF;
    background:rgba(32,22,73,.45);
    backdrop-filter:blur(20px);
    -webkit-backdrop-filter:blur(20px);
    border:1px solid rgba(255,255,255,.08);
    box-shadow:
        0 18px 40px rgba(88,214,255,.22),
        inset 0 1px 0 rgba(255,255,255,.08);
}

.cp-hero-quote svg {
    color: #57D8FF;
    flex: 0 0 auto;
    margin-top: 1px;
}

.cp-hero-quote p {
    margin: 0;
    color: rgba(255,255,255,0.82);
    font-size: 20px;
    line-height: 1.5;
    font-weight: 700;
}

/* Laptop Illustration */

.cp-laptop-scene{
    position:absolute;
    right:3.4%;
    top:25%;
    width:530px;
    z-index:5;
    pointer-events:none;
}

.cp-laptop-image{
    width:100%;
    height:auto;
    display:block;
    filter: none;
    -webkit-mask-image:linear-gradient(
        to bottom,
        black 0%,
        black 88%,
        transparent 100%
    );

    mask-image:linear-gradient(
        to bottom,
        black 0%,
        black 88%,
        transparent 100%
    );
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
    cursor: default;
    padding: 0;
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

@media (max-width: 1180px) and (min-width: 1024px) {
    .cp-hero-copy {
        left: 38px;
        top: 24px;
        max-width: 600px;
    }

    .cp-brand-lockup {
        margin-bottom: 18px;
    }

    .cp-hero-title {
        font-size: 2.25rem;
    }

    .cp-hero-subtitle {
        margin-top: 13px;
        font-size: 11.5px;
        max-width: 310px;
    }

    .cp-feature-list {
        margin-top: 17px;
        gap: 9px;
    }

    .cp-feature-icon {
        width: 29px;
        height: 29px;
        flex-basis: 29px;
    }

    .cp-feature-title {
        font-size: 11px;
    }

    .cp-feature-text {
        font-size: 9.5px;
    }

    .cp-hero-quote {
        left: 38px;
        bottom: 22px;
        transform: scale(0.94);
        transform-origin: left bottom;
    }

    .cp-laptop-scene {
        right: -35px;
        top: 17%;
        width: 300px;
        transform: scale(0.80);
        transform-origin: top right;
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
        display: none;
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
        padding-inline: 1.25rem;
    }

    .cp-theme-toggle {
        right: 20px;
        top: 20px;
    }
}
`;

const HeroFeature = ({ icon: Icon, title, text, color, bg }) => (
    <div className="cp-feature-row">
        <div
            className="cp-feature-icon"
            style={{
                color,
                background: bg
            }}
        >
            <Icon size={17} strokeWidth={2.35} />
        </div>

        <div>
            <p className="cp-feature-title">{title}</p>
            <p className="cp-feature-text">{text}</p>
        </div>
    </div>
);

const DashboardLaptop = () => (
    <div className="cp-laptop-scene">
        <img
            src={laptopImage}
            alt="Dashboard Preview"
            className="cp-laptop-image"
        />
    </div>
);

const AuthIllustration = ({ registerMode }) => (
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

            <div className="cp-feature-list">
                {HERO_FEATURES.map((item) => (
                    <HeroFeature key={item.title} {...item} />
                ))}
            </div>
        </div>

        <DashboardLaptop registerMode={registerMode} />

        <div className="cp-hero-quote">
            <Quote size={15} strokeWidth={2.5} />
            <p>
                One problem a day,
                <br />
                keeps rejection away.
            </p>
        </div>
    </aside>
);

const AuthLayout = ({
    children,
    illustration = 'login',
    showCenterDivider = false
}) => {
    const registerMode = illustration === 'register' || illustration === 'signup';
    return (
        <div className="codepulse-auth-shell">
            <style>{AUTH_LAYOUT_CSS}</style>
            {showCenterDivider && <div className="cp-center-divider" />}
            <AuthIllustration registerMode={registerMode} />
            <main className="codepulse-auth-panel">
                <div className="codepulse-curve-node" aria-hidden="true" />
                <div className="cp-auth-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AuthLayout;