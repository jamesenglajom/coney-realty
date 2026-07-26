we would want this to be the home page of this app.. break this into components based on the qualifications in our CLAUDE.md.. just use our theme colors to replace the templates color pallete.. everything must be responsive and darkmode ready.. assets are not available now so please skip it for now.. use next image and next link components..


<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ConeyRealty — Meet the agent, not the listing feed</title>
<meta name="description" content="Search homes by location, budget, and type and get matched with vetted local real estate agents you can call or email today." />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  :root{
    --paper:#EEF1EC; --ink:#14231B; --forest:#163A2A; --moss:#2E5C44;
    --brass:#BF9645; --stone:#66756B; --night:#0C1310; --surface:#15211B;
    --bg:var(--paper); --fg:var(--ink); --card:#ffffff; --line:rgba(20,35,27,.10);
    --muted:var(--stone);
  }
  html.dark{
    --bg:var(--night); --fg:var(--paper); --card:var(--surface); --line:rgba(238,241,236,.10);
    --muted:#9aa79e;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{
    margin:0; background:var(--bg); color:var(--fg);
    font-family:"Manrope",system-ui,sans-serif; line-height:1.5;
    -webkit-font-smoothing:antialiased; transition:background .3s,color .3s;
  }
  h1,h2,h3,.display{font-family:"Fraunces",Georgia,serif; letter-spacing:-.01em; margin:0}
  a{color:inherit; text-decoration:none}
  img{display:block; max-width:100%}
  ::selection{background:rgba(191,150,69,.3)}
  :focus-visible{outline:none; box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--brass); border-radius:6px}

  .wrap{max-width:1200px; margin:0 auto; padding:0 20px}
  @media(min-width:640px){.wrap{padding:0 32px}}
  .eyebrow{display:inline-flex; align-items:center; gap:8px; font-size:12px; font-weight:600;
    text-transform:uppercase; letter-spacing:.18em; color:var(--moss)}
  html.dark .eyebrow{color:var(--brass)}
  .eyebrow::before{content:""; width:24px; height:1px; background:var(--brass)}
  .eyebrow.on-dark{color:var(--brass)}

  .btn{display:inline-flex; align-items:center; justify-content:center; gap:8px; cursor:pointer;
    border:0; font-family:inherit; font-size:14px; font-weight:600; border-radius:999px;
    padding:12px 24px; transition:.2s}
  .btn-primary{background:var(--forest); color:var(--paper)}
  .btn-primary:hover{background:var(--moss)}
  html.dark .btn-primary{background:var(--brass); color:var(--night)}
  .btn-brass{background:var(--brass); color:var(--night)}
  .btn-brass:hover{filter:brightness(1.05)}
  .btn-ghost{background:transparent; color:var(--fg); border:1px solid var(--line)}
  .btn-ghost:hover{border-color:rgba(20,35,27,.4)}
  html.dark .btn-ghost:hover{border-color:rgba(238,241,236,.5)}

  .skip{position:absolute; left:-999px; top:0; z-index:100}
  .skip:focus{left:16px; top:16px; background:var(--forest); color:var(--paper); padding:8px 16px; border-radius:8px; font-weight:600}

  /* NAV */
  header.nav{position:sticky; top:0; z-index:50; transition:background .2s,border-color .2s;
    border-bottom:1px solid transparent}
  header.nav.scrolled{background:color-mix(in srgb,var(--bg) 85%,transparent);
    backdrop-filter:blur(12px); border-bottom:1px solid var(--line)}
  .nav-inner{display:flex; align-items:center; justify-content:space-between; height:64px}
  .brand{display:flex; align-items:center; gap:8px; font-family:"Fraunces"; font-size:20px; font-weight:600}
  .brand .mark{display:grid; place-items:center; width:28px; height:28px; border-radius:8px;
    background:var(--forest); color:var(--paper)}
  html.dark .brand .mark{background:var(--brass); color:var(--night)}
  .nav-links{display:none; gap:28px; list-style:none; margin:0; padding:0}
  .nav-links a{font-size:14px; font-weight:500; color:color-mix(in srgb,var(--fg) 75%,transparent)}
  .nav-links a:hover{color:var(--fg)}
  @media(min-width:900px){.nav-links{display:flex}}
  .nav-actions{display:flex; align-items:center; gap:8px}
  .icon-btn{display:grid; place-items:center; width:36px; height:36px; border-radius:999px;
    background:transparent; border:1px solid var(--line); color:var(--fg); cursor:pointer}
  .nav-cta{display:none}
  @media(min-width:640px){.nav-cta{display:inline-flex}}
  .menu-btn{display:grid}
  @media(min-width:900px){.menu-btn{display:none}}
  #mobileMenu{display:none; border-top:1px solid var(--line); background:var(--bg)}
  #mobileMenu.open{display:block}
  #mobileMenu ul{list-style:none; margin:0; padding:12px 0}
  #mobileMenu a{display:block; padding:12px 8px; font-size:14px; font-weight:500; border-radius:8px}
  #mobileMenu a:hover{background:rgba(20,35,27,.05)}

  /* HERO */
  .hero{position:relative; isolation:isolate; overflow:hidden}
  .hero-media{position:absolute; inset:0; z-index:-2}
  .hero-media video, .hero-media .poster{width:100%; height:100%; object-fit:cover}
  .hero-media .poster{
    background-size:cover; background-position:center;
    animation:kenburns 22s ease-in-out infinite alternate;
  }
  @keyframes kenburns{from{transform:scale(1.02)}to{transform:scale(1.14)}}
  .hero-scrim{position:absolute; inset:0; z-index:-1;
    background:linear-gradient(to bottom,rgba(20,35,27,.7),rgba(20,35,27,.45) 40%,rgba(20,35,27,.9))}
  .hero-inner{min-height:92vh; min-height:92svh; display:flex; flex-direction:column;
    justify-content:flex-end; gap:40px; padding:112px 0 40px}
  @media(min-width:640px){.hero-inner{padding-bottom:64px}}
  .hero-copy{max-width:760px; color:var(--paper)}
  .hero h1{font-size:clamp(40px,8vw,76px); font-weight:600; line-height:1.02; margin-top:16px}
  .hero p.lead{margin-top:20px; max-width:560px; font-size:18px; color:rgba(238,241,236,.85)}
  .hero .note{margin-top:12px; font-size:12px; color:rgba(238,241,236,.7)}

  /* SEARCH */
  .search{display:grid; gap:12px; padding:16px; border-radius:24px; border:1px solid var(--line);
    background:color-mix(in srgb,var(--bg) 95%,transparent); backdrop-filter:blur(10px);
    box-shadow:0 20px 48px -20px rgba(20,35,27,.4)}
  @media(min-width:820px){.search{grid-template-columns:1fr 1fr 1fr auto; align-items:end}}
  .field-label{display:block; margin-bottom:6px; font-size:11px; font-weight:600;
    text-transform:uppercase; letter-spacing:.08em; color:var(--muted)}
  .field{width:100%; border-radius:12px; border:1px solid var(--line); background:color-mix(in srgb,var(--card) 70%,transparent);
    padding:12px 14px; font-family:inherit; font-size:14px; color:var(--fg)}
  html.dark .field{background:rgba(255,255,255,.05)}
  .field:focus{outline:none; border-color:var(--moss)}
  .search .btn{height:46px}

  .results{margin-top:24px}
  .results .count{font-size:14px; color:var(--muted); margin:0 0 12px}
  .agent-grid{list-style:none; margin:0; padding:0; display:grid; gap:16px}
  @media(min-width:600px){.agent-grid{grid-template-columns:1fr 1fr}}
  @media(min-width:1000px){.agent-grid{grid-template-columns:1fr 1fr 1fr}}
  .agent-card{display:flex; flex-direction:column; padding:16px; border-radius:16px;
    border:1px solid var(--line); background:color-mix(in srgb,var(--card) 92%,transparent);
    box-shadow:0 8px 24px -12px rgba(20,35,27,.18)}
  .agent-top{display:flex; align-items:center; gap:12px}
  .agent-top img{width:52px; height:52px; border-radius:999px; object-fit:cover}
  .agent-name{font-weight:600}
  .agent-role{font-size:12px; color:var(--muted)}
  .badge{margin-left:auto; display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:600;
    padding:4px 8px; border-radius:999px; background:rgba(191,150,69,.15); color:var(--moss)}
  html.dark .badge{color:var(--brass)}
  .agent-blurb{margin:12px 0 0; font-size:14px; color:color-mix(in srgb,var(--fg) 78%,transparent)}
  .agent-meta{margin:8px 0 0; font-size:12px; color:var(--muted)}
  .agent-actions{display:flex; gap:8px; margin-top:16px}
  .agent-actions .btn{flex:1; padding:8px 12px; font-size:12px}
  .empty{padding:24px; border-radius:16px; border:1px solid var(--line);
    background:color-mix(in srgb,var(--card) 90%,transparent); font-size:14px; color:var(--muted)}

  /* SECTION HELPERS */
  section{scroll-margin-top:80px}
  .pad{padding:80px 0}
  @media(min-width:640px){.pad{padding:112px 0}}
  .head-row{display:flex; flex-direction:column; gap:24px}
  @media(min-width:640px){.head-row{flex-direction:row; align-items:flex-end; justify-content:space-between}}
  .h2{font-size:clamp(32px,5vw,52px); font-weight:600; margin-top:12px}
  .sub{margin-top:16px; color:color-mix(in srgb,var(--fg) 70%,transparent); max-width:560px}

  /* STATS */
  .stats{background:var(--forest); color:var(--paper); border-top:1px solid var(--line); border-bottom:1px solid var(--line)}
  .stats-grid{display:grid; grid-template-columns:1fr 1fr; gap:32px; padding:48px 0}
  @media(min-width:768px){.stats-grid{grid-template-columns:repeat(4,1fr)}}
  .stat-val{font-family:"Fraunces"; font-weight:600; font-size:clamp(34px,5vw,50px); color:var(--brass)}
  .stat-lab{margin-top:4px; font-size:14px; color:rgba(238,241,236,.7)}

  /* FEATURED */
  .cards{list-style:none; margin:48px 0 0; padding:0; display:grid; gap:24px}
  @media(min-width:600px){.cards{grid-template-columns:1fr 1fr}}
  @media(min-width:1000px){.cards{grid-template-columns:1fr 1fr 1fr}}
  .prop{overflow:hidden; border-radius:24px; border:1px solid var(--line); background:var(--card);
    box-shadow:0 8px 24px -12px rgba(20,35,27,.18); transition:box-shadow .3s}
  .prop:hover{box-shadow:0 20px 48px -20px rgba(20,35,27,.32)}
  .prop-img{position:relative; aspect-ratio:4/3; overflow:hidden}
  .prop-img img{width:100%; height:100%; object-fit:cover; transition:transform .5s}
  .prop:hover .prop-img img{transform:scale(1.04)}
  .prop-tag{position:absolute; left:12px; top:12px; padding:4px 12px; border-radius:999px; font-size:12px;
    font-weight:600; background:color-mix(in srgb,var(--bg) 90%,transparent); backdrop-filter:blur(4px)}
  .prop-body{padding:20px}
  .prop-title-row{display:flex; align-items:baseline; justify-content:space-between; gap:12px}
  .prop h3{font-size:20px; font-weight:600}
  .prop-price{white-space:nowrap; font-weight:600; color:var(--moss)}
  html.dark .prop-price{color:var(--brass)}
  .prop-city{margin:4px 0 0; font-size:14px; color:var(--muted)}
  .prop-specs{display:flex; gap:20px; margin-top:16px; font-size:14px; color:color-mix(in srgb,var(--fg) 78%,transparent)}
  .prop-specs span{display:inline-flex; align-items:center; gap:6px}
  .prop-foot{display:flex; align-items:center; justify-content:space-between; gap:8px;
    margin-top:20px; padding-top:16px; border-top:1px solid var(--line); font-size:12px; color:var(--muted)}
  .prop-foot .contact{font-size:14px; font-weight:600; color:var(--moss)}
  html.dark .prop-foot .contact{color:var(--brass)}
  .prop-foot .contact:hover{text-decoration:underline; text-underline-offset:4px}

  /* LEADERBOARD */
  .board{background:var(--forest); color:var(--paper)}
  .podium{display:grid; grid-template-columns:1fr 1fr 1fr; align-items:end; gap:12px; margin-top:56px}
  @media(min-width:640px){.podium{gap:24px}}
  .pod{display:flex; flex-direction:column; align-items:center; text-align:center}
  .pod .ring{position:relative; border-radius:999px; overflow:visible}
  .pod img{border-radius:999px; object-fit:cover}
  .pod .r2 img,.pod .r3 img{width:80px; height:80px}
  @media(min-width:640px){.pod .r2 img,.pod .r3 img{width:96px; height:96px}}
  .pod .r2 .frame,.pod .r3 .frame{box-shadow:0 0 0 4px rgba(238,241,236,.3); border-radius:999px}
  .pod .r1 img{width:112px; height:112px}
  @media(min-width:640px){.pod .r1 img{width:144px; height:144px}}
  .pod .r1 .frame{box-shadow:0 0 0 4px var(--brass); border-radius:999px}
  .frame{position:relative; border-radius:999px; overflow:hidden}
  .rankbadge{position:absolute; bottom:-8px; left:50%; transform:translateX(-50%);
    display:grid; place-items:center; border-radius:999px; font-family:"Fraunces"; font-weight:600}
  .rankbadge.first{width:36px; height:36px; background:var(--brass); color:var(--night); font-size:18px}
  .rankbadge.other{width:28px; height:28px; background:var(--paper); color:var(--forest)}
  .pod-name{margin-top:20px; font-weight:600}
  .pod-name.lead{font-size:18px}
  .pod-role{font-size:12px; color:rgba(238,241,236,.65)}
  .pod-stat{margin-top:4px; font-size:12px; font-weight:500; color:var(--brass)}
  .rank-list{list-style:none; margin:56px 0 0; padding:0; display:grid; gap:12px}
  @media(min-width:640px){.rank-list{grid-template-columns:1fr 1fr}}
  .rank-row{display:flex; align-items:center; gap:16px; padding:12px; border-radius:16px;
    border:1px solid rgba(238,241,236,.1); background:rgba(238,241,236,.05)}
  .rank-num{width:24px; text-align:center; font-family:"Fraunces"; font-size:18px; font-weight:600; color:rgba(238,241,236,.5)}
  .rank-row img{width:44px; height:44px; border-radius:999px; object-fit:cover}
  .rank-info{flex:1; min-width:0}
  .rank-info .n{font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
  .rank-info .r{font-size:12px; color:rgba(238,241,236,.6)}
  .rank-right{text-align:right}
  .rank-right .s{font-size:14px; font-weight:600; color:var(--brass)}
  .rank-right .d{font-size:12px; color:rgba(238,241,236,.6)}

  /* TESTIMONIAL */
  .quote-wrap{border-top:1px solid var(--line); border-bottom:1px solid var(--line); background:color-mix(in srgb,var(--card) 40%,var(--bg))}
  .quote{display:grid; gap:40px; align-items:center; padding:80px 0}
  @media(min-width:768px){.quote{grid-template-columns:auto 1fr}}
  .quote img{width:224px; height:224px; border-radius:32px; object-fit:cover; margin:0 auto}
  .quote .mark{font-family:"Fraunces"; font-size:60px; line-height:1; color:var(--brass)}
  .quote blockquote{margin:8px 0 0; font-family:"Fraunces"; font-weight:500; font-size:clamp(22px,3.5vw,30px); line-height:1.25}
  .quote figcaption{margin-top:24px; font-size:14px}
  .quote figcaption .who{font-weight:600}
  .quote figcaption .role{color:var(--muted)}

  /* BLOG */
  .posts{display:grid; gap:24px; margin-top:48px}
  @media(min-width:768px){.posts{grid-template-columns:1fr 1fr 1fr}}
  .post{position:relative; display:flex; flex-direction:column; overflow:hidden; border-radius:24px;
    border:1px solid var(--line); background:var(--card); box-shadow:0 8px 24px -12px rgba(20,35,27,.18); transition:box-shadow .3s}
  .post:hover{box-shadow:0 20px 48px -20px rgba(20,35,27,.32)}
  .post-img{aspect-ratio:16/10; overflow:hidden}
  .post-img img{width:100%; height:100%; object-fit:cover; transition:transform .5s}
  .post:hover .post-img img{transform:scale(1.04)}
  .post-body{display:flex; flex-direction:column; flex:1; padding:20px}
  .post-tags{display:flex; align-items:center; gap:8px; font-size:12px; color:var(--muted)}
  .chip{padding:4px 10px; border-radius:999px; font-weight:600; background:rgba(191,150,69,.15); color:var(--moss)}
  html.dark .chip{color:var(--brass)}
  .post h3{margin-top:12px; font-size:20px; font-weight:600; line-height:1.3}
  .post p{margin:8px 0 0; font-size:14px; color:color-mix(in srgb,var(--fg) 70%,transparent)}
  .post time{margin-top:auto; padding-top:16px; font-size:12px; color:var(--muted)}
  .post h3 a::after{content:""; position:absolute; inset:0}

  /* CTA */
  .cta-box{position:relative; overflow:hidden; border-radius:32px; background:var(--forest); color:var(--paper);
    text-align:center; padding:64px 24px}
  @media(min-width:640px){.cta-box{padding:80px 64px}}
  .cta-glow{position:absolute; right:-64px; top:-64px; width:256px; height:256px; border-radius:999px;
    background:rgba(191,150,69,.2); filter:blur(60px); pointer-events:none}
  .cta-box .eyebrow{justify-content:center}
  .cta-box h2{margin:16px auto 0; max-width:640px; font-size:clamp(32px,5vw,52px); font-weight:600}
  .cta-box p{margin:16px auto 0; max-width:520px; color:rgba(238,241,236,.8)}
  .cta-actions{display:flex; flex-wrap:wrap; justify-content:center; gap:12px; margin-top:32px}

  /* FOOTER */
  footer{border-top:1px solid var(--line); background:var(--bg)}
  .foot-grid{display:grid; gap:40px; padding:64px 0}
  @media(min-width:768px){.foot-grid{grid-template-columns:1.4fr 1fr 1fr 1fr}}
  .foot-about p{margin-top:16px; max-width:280px; font-size:14px; color:var(--muted)}
  .foot-about address{margin-top:16px; font-style:normal; font-size:14px; color:var(--muted)}
  .foot-col h3{font-family:"Manrope"; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--muted)}
  .foot-col ul{list-style:none; margin:16px 0 0; padding:0; display:grid; gap:10px}
  .foot-col a{font-size:14px; color:color-mix(in srgb,var(--fg) 75%,transparent)}
  .foot-col a:hover{color:var(--fg)}
  .foot-bottom{border-top:1px solid var(--line)}
  .foot-bottom .row{display:flex; flex-direction:column; gap:12px; align-items:center; justify-content:space-between;
    padding:24px 0; font-size:12px; color:var(--muted)}
  @media(min-width:640px){.foot-bottom .row{flex-direction:row}}

  @media(prefers-reduced-motion:reduce){
    *{animation-duration:.001ms !important; transition-duration:.001ms !important}
    html{scroll-behavior:auto}
  }
</style>
</head>
<body>
<a href="#main" class="skip">Skip to content</a>

<!-- NAV -->
<header class="nav" id="nav">
  <div class="wrap nav-inner">
    <a href="#top" class="brand"><span class="mark" aria-hidden="true">H</span>ConeyRealty</a>
    <ul class="nav-links">
      <li><a href="#search">Find an agent</a></li>
      <li><a href="#featured">Featured homes</a></li>
      <li><a href="#leaderboard">Top agents</a></li>
      <li><a href="#insight">Insight</a></li>
    </ul>
    <div class="nav-actions">
      <button class="icon-btn" id="themeBtn" aria-label="Toggle dark mode">
        <svg id="moonIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
        <svg id="sunIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:none" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      </button>
      <a href="#search" class="btn btn-primary nav-cta">Get matched</a>
      <button class="icon-btn menu-btn" id="menuBtn" aria-label="Toggle menu" aria-expanded="false" aria-controls="mobileMenu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
    </div>
  </div>
  <div id="mobileMenu">
    <div class="wrap">
      <ul>
        <li><a href="#search">Find an agent</a></li>
        <li><a href="#featured">Featured homes</a></li>
        <li><a href="#leaderboard">Top agents</a></li>
        <li><a href="#insight">Insight</a></li>
        <li><a href="#search" class="btn btn-primary" style="width:100%;margin-top:8px">Get matched</a></li>
      </ul>
    </div>
  </div>
</header>

<main id="main">
<!-- HERO -->
<section class="hero" id="top">
  <div class="hero-media">
    <div class="poster" style="background-image:url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=60')"></div>
  </div>
  <div class="hero-scrim"></div>
  <div class="wrap hero-inner">
    <div class="hero-copy">
      <span class="eyebrow on-dark">People, not portals</span>
      <h1>Meet the agent,<br>not the listing feed.</h1>
      <p class="lead">Tell us where you want to live, your budget, and the kind of home. We match you with vetted local agents you can call or email today — including the homes that never hit public sites.</p>
    </div>
    <div id="search">
      <form class="search" id="searchForm" role="search" aria-label="Find an agent by property">
        <div>
          <label class="field-label" for="loc">Location</label>
          <select class="field" id="loc"><option value="">Anywhere</option></select>
        </div>
        <div>
          <label class="field-label" for="type">Property type</label>
          <select class="field" id="type"><option value="">Any type</option></select>
        </div>
        <div>
          <label class="field-label" for="price">Budget</label>
          <select class="field" id="price"></select>
        </div>
        <button type="submit" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          Find agents
        </button>
      </form>
      <p class="note">Search returns agents, not addresses. Full details come from the person who knows the home.</p>
      <div class="results" id="results" tabindex="-1" aria-live="polite"></div>
    </div>
  </div>
</section>

<!-- STATS -->
<section class="stats" aria-label="Company results">
  <div class="wrap stats-grid">
    <div><div class="stat-val">$2.4B</div><div class="stat-lab">Sold in 2025</div></div>
    <div><div class="stat-val">3,100+</div><div class="stat-lab">Families placed</div></div>
    <div><div class="stat-val">38</div><div class="stat-lab">Cities covered</div></div>
    <div><div class="stat-val">4.9/5</div><div class="stat-lab">Client rating</div></div>
  </div>
</section>

<!-- FEATURED -->
<section id="featured" class="pad">
  <div class="wrap">
    <div class="head-row">
      <div>
        <span class="eyebrow">Featured homes</span>
        <h2 class="h2">A taste of the current collection</h2>
        <p class="sub">We show the shape of a home — never the full file. Exact address, disclosures, and viewings come from the listing agent, so nothing here can be scraped and re-listed.</p>
      </div>
      <a href="#search" class="btn btn-ghost">Search by your criteria</a>
    </div>
    <ul class="cards" id="featuredGrid"></ul>
  </div>
</section>

<!-- LEADERBOARD -->
<section id="leaderboard" class="board">
  <div class="wrap pad">
    <div style="max-width:560px">
      <span class="eyebrow on-dark">This quarter</span>
      <h2 class="h2">The agents topping the board</h2>
      <p class="sub" style="color:rgba(238,241,236,.75)">Ranked by client rating and closings — the people you actually want in your corner.</p>
    </div>
    <div class="podium" id="podium"></div>
    <ol class="rank-list" id="rankList"></ol>
  </div>
</section>

<!-- TESTIMONIAL -->
<section class="quote-wrap" aria-label="Client story">
  <div class="wrap quote">
    <img src="https://randomuser.me/api/portraits/men/41.jpg" alt="Client Sajib Rahman" loading="lazy" width="224" height="224" />
    <figure style="margin:0">
      <span class="mark" aria-hidden="true">&ldquo;</span>
      <blockquote>They didn't send me a wall of listings. They sent me one agent who already knew three homes in my range — one wasn't even public yet. We closed in five weeks.</blockquote>
      <figcaption><span class="who">Sajib Rahman</span><span class="role"> — first-time buyer, Denver</span></figcaption>
    </figure>
  </div>
</section>

<!-- BLOG -->
<section id="insight" class="pad">
  <div class="wrap">
    <div class="head-row">
      <div>
        <span class="eyebrow">From the desk</span>
        <h2 class="h2">Market insight, written by people who close deals</h2>
      </div>
      <a href="#insight" class="btn btn-ghost">All articles</a>
    </div>
    <div class="posts" id="postsGrid"></div>
  </div>
</section>

<!-- CTA -->
<section aria-label="Get started" class="pad" style="padding-top:0">
  <div class="wrap">
    <div class="cta-box">
      <div class="cta-glow" aria-hidden="true"></div>
      <span class="eyebrow on-dark">Ready when you are</span>
      <h2>Make your next move with someone who actually picks up</h2>
      <p>One quick search and you're talking to a real agent — not a chatbot, not a form that disappears into a queue.</p>
      <div class="cta-actions">
        <a href="#search" class="btn btn-brass">Find my agent</a>
        <a href="#leaderboard" class="btn btn-ghost" style="border-color:rgba(238,241,236,.3);color:var(--paper)">Meet the team</a>
      </div>
    </div>
  </div>
</section>
</main>

<!-- FOOTER -->
<footer>
  <div class="wrap foot-grid">
    <div class="foot-about">
      <a href="#top" class="brand"><span class="mark" aria-hidden="true">H</span>ConeyRealty</a>
      <p>A real estate platform built around people. Search homes, meet the agent, skip the scrape-able listing feeds.</p>
      <address>123 Cedar Row, Austin, TX 78701<br><a href="tel:+15125550100">+1 (512) 555-0100</a></address>
    </div>
    <nav class="foot-col" aria-label="Explore"><h3>Explore</h3><ul><li><a href="#search">Find an agent</a></li><li><a href="#featured">Featured homes</a></li><li><a href="#leaderboard">Top agents</a></li><li><a href="#insight">Insight</a></li></ul></nav>
    <nav class="foot-col" aria-label="Company"><h3>Company</h3><ul><li><a href="#">About</a></li><li><a href="#">Careers</a></li><li><a href="#">Press</a></li><li><a href="#">Contact</a></li></ul></nav>
    <nav class="foot-col" aria-label="Legal"><h3>Legal</h3><ul><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li><li><a href="#">Fair housing</a></li><li><a href="#">Accessibility</a></li></ul></nav>
  </div>
  <div class="foot-bottom"><div class="wrap row"><p>© 2026 ConeyRealty. All rights reserved.</p><p>Equal Housing Opportunity</p></div></div>
</footer>

<script>
(function(){
  "use strict";

  // ---- Data ----
  var CITIES = ["Austin, TX","Denver, CO","Portland, OR","Nashville, TN","Raleigh, NC","Boise, ID"];
  var TYPES = ["House","Apartment","Villa","Condo","Land"];
  var BANDS = [
    {label:"Any price",min:0,max:Infinity},
    {label:"Under $300k",min:0,max:300000},
    {label:"$300k – $600k",min:300000,max:600000},
    {label:"$600k – $1M",min:600000,max:1000000},
    {label:"$1M – $2M",min:1000000,max:2000000},
    {label:"$2M+",min:2000000,max:Infinity}
  ];
  var AGENTS = [
    {id:"a1",name:"Maya Okonkwo",title:"Principal Broker",photo:"https://randomuser.me/api/portraits/women/68.jpg",phone:"+1-512-555-0142",email:"maya@ConeyRealty.example",rating:4.9,deals:214,volume:"$182M",regions:["Austin, TX","Nashville, TN"],types:["House","Villa","Condo"],band:{min:600000,max:3500000},blurb:"Luxury & new-build specialist with a 12-year track record in Central Texas."},
    {id:"a2",name:"Daniel Reyes",title:"Senior Agent",photo:"https://randomuser.me/api/portraits/men/32.jpg",phone:"+1-303-555-0188",email:"daniel@ConeyRealty.example",rating:4.8,deals:176,volume:"$121M",regions:["Denver, CO","Boise, ID"],types:["House","Condo","Apartment"],band:{min:250000,max:1200000},blurb:"First-time buyers and relocation moves across the Mountain West."},
    {id:"a3",name:"Priya Nair",title:"Luxury Advisor",photo:"https://randomuser.me/api/portraits/women/44.jpg",phone:"+1-971-555-0119",email:"priya@ConeyRealty.example",rating:5.0,deals:198,volume:"$240M",regions:["Portland, OR","Austin, TX"],types:["Villa","House","Land"],band:{min:900000,max:6000000},blurb:"Architectural and estate homes with private, off-market inventory."},
    {id:"a4",name:"Marcus Feld",title:"Investment Specialist",photo:"https://randomuser.me/api/portraits/men/75.jpg",phone:"+1-984-555-0173",email:"marcus@ConeyRealty.example",rating:4.7,deals:152,volume:"$98M",regions:["Raleigh, NC","Nashville, TN"],types:["Apartment","Condo","Land"],band:{min:150000,max:850000},blurb:"Multi-unit and land plays for buy-and-hold investors."},
    {id:"a5",name:"Sofia Bellini",title:"Associate Broker",photo:"https://randomuser.me/api/portraits/women/90.jpg",phone:"+1-208-555-0155",email:"sofia@ConeyRealty.example",rating:4.9,deals:168,volume:"$110M",regions:["Boise, ID","Denver, CO"],types:["House","Villa","Condo"],band:{min:400000,max:2000000},blurb:"Move-up families and vacation homes near the foothills."},
    {id:"a6",name:"Andre Whitfield",title:"Senior Agent",photo:"https://randomuser.me/api/portraits/men/51.jpg",phone:"+1-615-555-0126",email:"andre@ConeyRealty.example",rating:4.8,deals:141,volume:"$87M",regions:["Nashville, TN","Raleigh, NC"],types:["House","Apartment","Condo"],band:{min:200000,max:950000},blurb:"Historic districts and walkable urban neighborhoods."},
    {id:"a7",name:"Grace Liang",title:"Relocation Lead",photo:"https://randomuser.me/api/portraits/women/12.jpg",phone:"+1-512-555-0197",email:"grace@ConeyRealty.example",rating:4.9,deals:133,volume:"$79M",regions:["Austin, TX","Portland, OR"],types:["Apartment","Condo","House"],band:{min:300000,max:1400000},blurb:"Corporate relocations and remote-first buyers."},
    {id:"a8",name:"Tom Håkansson",title:"Land & New Development",photo:"https://randomuser.me/api/portraits/men/64.jpg",phone:"+1-503-555-0148",email:"tom@ConeyRealty.example",rating:4.7,deals:121,volume:"$134M",regions:["Portland, OR","Boise, ID"],types:["Land","Villa","House"],band:{min:500000,max:4000000},blurb:"Acreage, custom builds, and pre-construction reservations."}
  ];
  var FEATURED = [
    {name:"Cedar Ridge Residence",city:"Austin, TX",priceLabel:"From $1.2M",beds:4,baths:3,type:"Villa",agentId:"a1",image:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=70"},
    {name:"Foothill Modern",city:"Boise, ID",priceLabel:"From $780k",beds:3,baths:2,type:"House",agentId:"a5",image:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=70"},
    {name:"Willamette Loft",city:"Portland, OR",priceLabel:"From $540k",beds:2,baths:2,type:"Condo",agentId:"a7",image:"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=70"},
    {name:"Magnolia Row House",city:"Nashville, TN",priceLabel:"From $690k",beds:3,baths:3,type:"House",agentId:"a6",image:"https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=70"},
    {name:"Blue Spruce Estate",city:"Denver, CO",priceLabel:"From $1.6M",beds:5,baths:4,type:"Villa",agentId:"a2",image:"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=70"},
    {name:"Research Triangle Flat",city:"Raleigh, NC",priceLabel:"From $360k",beds:2,baths:1,type:"Apartment",agentId:"a4",image:"https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=70"}
  ];
  var POSTS = [
    {title:"What a rate cut actually does to your buying power",excerpt:"Half a point sounds small. On a 30-year note it can move your budget by tens of thousands. Here is the math, plainly.",category:"Market",readMins:5,date:"2026-07-08",image:"https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=70"},
    {title:"The relocation checklist our top agents swear by",excerpt:"Moving across states? The order you do things in matters more than the things themselves. A field-tested sequence.",category:"Guides",readMins:7,date:"2026-06-27",image:"https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=70"},
    {title:"Why off-market inventory is having a moment",excerpt:"The best homes never hit the public feeds. How pocket listings work, and how buyers get early access through an agent.",category:"Insight",readMins:4,date:"2026-06-15",image:"https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=70"}
  ];
  var agentById = {}; AGENTS.forEach(function(a){agentById[a.id]=a;});

  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}

  // ---- Populate selects ----
  var locSel=document.getElementById("loc"), typeSel=document.getElementById("type"), priceSel=document.getElementById("price");
  CITIES.forEach(function(c){var o=document.createElement("option");o.value=c;o.textContent=c;locSel.appendChild(o);});
  TYPES.forEach(function(t){var o=document.createElement("option");o.value=t;o.textContent=t;typeSel.appendChild(o);});
  BANDS.forEach(function(b,i){var o=document.createElement("option");o.value=i;o.textContent=b.label;priceSel.appendChild(o);});

  // ---- Search: return agents, never listings ----
  function matchAgents(location,type,bandIdx){
    var band = bandIdx>0 ? BANDS[bandIdx] : null;
    return AGENTS.filter(function(a){
      var locOk = !location || a.regions.indexOf(location)>=0;
      var typeOk = !type || a.types.indexOf(type)>=0;
      var bandOk = !band || (band.min < a.band.max && band.max > a.band.min);
      return locOk && typeOk && bandOk;
    }).sort(function(a,b){return b.rating-a.rating || b.deals-a.deals;});
  }
  function agentCard(a){
    return '<li class="agent-card">'+
      '<div class="agent-top">'+
        '<img src="'+a.photo+'" alt="'+esc(a.name)+'" loading="lazy" width="52" height="52">'+
        '<div style="min-width:0"><p class="agent-name">'+esc(a.name)+'</p><p class="agent-role">'+esc(a.title)+'</p></div>'+
        '<span class="badge">★ '+a.rating.toFixed(1)+'</span>'+
      '</div>'+
      '<p class="agent-blurb">'+esc(a.blurb)+'</p>'+
      '<p class="agent-meta">'+esc(a.regions.join(" · "))+' — '+a.deals+' deals closed</p>'+
      '<div class="agent-actions">'+
        '<a class="btn btn-primary" href="tel:'+a.phone+'">Call</a>'+
        '<a class="btn btn-ghost" href="mailto:'+a.email+'?subject=ConeyRealty%20enquiry">Email</a>'+
      '</div></li>';
  }
  var results=document.getElementById("results");
  document.getElementById("searchForm").addEventListener("submit",function(e){
    e.preventDefault();
    var matched=matchAgents(locSel.value,typeSel.value,Number(priceSel.value));
    if(matched.length===0){
      results.innerHTML='<div class="empty">No agents cover that mix yet. Try widening the budget or picking a nearby city — our team is expanding fast.</div>';
    } else {
      var plural = matched.length===1 ? "agent handles" : "agents handle";
      results.innerHTML='<p class="count">'+matched.length+' '+plural+' homes matching your search. Reach out directly — no forms, no wait.</p>'+
        '<ul class="agent-grid">'+matched.map(agentCard).join("")+'</ul>';
    }
    requestAnimationFrame(function(){results.focus();results.scrollIntoView({behavior:"smooth",block:"nearest"});});
  });

  // ---- Featured ----
  document.getElementById("featuredGrid").innerHTML = FEATURED.map(function(p,i){
    var agent=agentById[p.agentId];
    var eager = i<3 ? "eager":"lazy";
    return '<li class="prop"><div class="prop-img">'+
      '<img src="'+p.image+'" alt="'+esc(p.name)+' in '+esc(p.city)+'" loading="'+eager+'">'+
      '<span class="prop-tag">'+esc(p.type)+'</span></div>'+
      '<div class="prop-body"><div class="prop-title-row"><h3>'+esc(p.name)+'</h3>'+
      '<span class="prop-price">'+esc(p.priceLabel)+'</span></div>'+
      '<p class="prop-city">'+esc(p.city)+'</p>'+
      '<div class="prop-specs"><span>🛏 '+p.beds+' bd</span><span>🛁 '+p.baths+' ba</span></div>'+
      '<div class="prop-foot"><span>Listed by <strong style="color:var(--fg)">'+esc(agent.name)+'</strong></span>'+
      '<a class="contact" href="tel:'+agent.phone+'">Contact for details →</a></div></div></li>';
  }).join("");

  // ---- Leaderboard ----
  var ranked = AGENTS.slice().sort(function(a,b){return b.rating-a.rating || b.deals-a.deals;}).slice(0,8);
  var first=ranked[0],second=ranked[1],third=ranked[2],rest=ranked.slice(3);
  var podium=[{a:second,rank:2},{a:first,rank:1},{a:third,rank:3}];
  document.getElementById("podium").innerHTML = podium.map(function(p){
    var a=p.a, lead=p.rank===1;
    var rc = lead?"r1":(p.rank===2?"r2":"r3");
    var badge = lead?'<span class="rankbadge first">1</span>':'<span class="rankbadge other">'+p.rank+'</span>';
    return '<div class="pod"><div class="ring '+rc+'"><div class="frame">'+
      '<img src="'+a.photo+'" alt="'+esc(a.name)+'" loading="lazy"></div>'+badge+'</div>'+
      '<p class="pod-name'+(lead?' lead':'')+'">'+esc(a.name)+'</p>'+
      '<p class="pod-role">'+esc(a.title)+'</p>'+
      '<p class="pod-stat">'+esc(a.volume)+' · '+a.deals+' deals</p></div>';
  }).join("");
  document.getElementById("rankList").innerHTML = rest.map(function(a,i){
    return '<li class="rank-row"><span class="rank-num">'+(i+4)+'</span>'+
      '<img src="'+a.photo+'" alt="'+esc(a.name)+'" loading="lazy">'+
      '<div class="rank-info"><p class="n">'+esc(a.name)+'</p><p class="r">'+esc(a.regions.join(" · "))+'</p></div>'+
      '<div class="rank-right"><p class="s">'+a.rating.toFixed(1)+'★</p><p class="d">'+a.deals+' deals</p></div></li>';
  }).join("");

  // ---- Blog ----
  function fmt(iso){var d=new Date(iso);return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});}
  document.getElementById("postsGrid").innerHTML = POSTS.map(function(p){
    return '<article class="post"><div class="post-img"><img src="'+p.image+'" alt="" loading="lazy"></div>'+
      '<div class="post-body"><div class="post-tags"><span class="chip">'+esc(p.category)+'</span><span>'+p.readMins+' min read</span></div>'+
      '<h3><a href="#insight">'+esc(p.title)+'</a></h3><p>'+esc(p.excerpt)+'</p>'+
      '<time datetime="'+p.date+'">'+fmt(p.date)+'</time></div></article>';
  }).join("");

  // ---- Theme toggle (in-memory; artifacts can't use localStorage) ----
  var themeBtn=document.getElementById("themeBtn"),moon=document.getElementById("moonIcon"),sun=document.getElementById("sunIcon");
  if(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches){
    document.documentElement.classList.add("dark");
  }
  function syncIcons(){var dark=document.documentElement.classList.contains("dark");
    moon.style.display=dark?"none":"block"; sun.style.display=dark?"block":"none";}
  syncIcons();
  themeBtn.addEventListener("click",function(){document.documentElement.classList.toggle("dark");syncIcons();});

  // ---- Mobile menu ----
  var menuBtn=document.getElementById("menuBtn"),menu=document.getElementById("mobileMenu");
  menuBtn.addEventListener("click",function(){
    var open=menu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded",open?"true":"false");
  });
  menu.querySelectorAll("a").forEach(function(a){a.addEventListener("click",function(){menu.classList.remove("open");menuBtn.setAttribute("aria-expanded","false");});});

  // ---- Nav scroll state ----
  var nav=document.getElementById("nav");
  function onScroll(){nav.classList.toggle("scrolled",window.scrollY>12);}
  onScroll(); window.addEventListener("scroll",onScroll,{passive:true});
})();
</script>
</body>
</html>