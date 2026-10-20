/**
 * Every piece of visible text on the site lives here.
 * Values wrapped in [SQUARE_BRACKETS] are placeholders — replace them with real
 * details. Components detect placeholders and render them as inert, so nothing
 * links to a broken URL before it is filled in.
 *
 * This file contains the default content; use useContent() for rendered content.
 */

import type { JourneyItem, Project, ProjectFlowStep, ProjectLink } from './schema'

export type { Project, ProjectLink } from './schema'

const person = {
  name: 'Arman Kaushik',
  firstName: 'Arman',
  initials: 'AK',
  tagline: 'Third-year CSE student at SKIT Jaipur, building machine learning and data tools.',
  college: 'SKIT Jaipur',
  degree: 'B.Tech, Computer Science & Engineering',
  email: 'b241706@skit.ac.in',
  resumeUrl: '/Arman_kaushik_resume.pdf',
  photo: { src: '/img/profile.jpg', alt: 'Portrait of Arman Kaushik' },
  githubUsername: 'B241561',
  socials: {
    github: 'https://github.com/B241561',
    linkedin: 'https://www.linkedin.com/in/arman-kaushik-29b5b6370/',
  },
}

const projects: Project[] = [
  {
    id: 'feynml',
    index: '01',
    title: 'FeynML',
    tagline: 'ML failure investigation platform',
    summary: 'Investigates why machine learning models fail — across drift, calibration, fairness and data integrity.',
    icon: 'feynml',
    image: '/img/feynml.png',
    imageAlt: 'FeynML dashboard showing drift, calibration and fairness metrics',
    screenshots: [{ src: '/img/feynml.png', alt: 'FeynML dashboard showing drift, calibration and fairness metrics' }],
    tags: ['Python', 'Flask', 'Machine Learning', 'Data Science'],
    demoVideoUrl: 'https://youtu.be/0jthubG-RxY',
    flowSteps: [
      { id: 'drift', label: 'Drift', description: 'Drift — check whether the data a model sees has shifted.' },
      { id: 'calibration', label: 'Calibration', description: 'Calibration — check whether predicted confidence matches what actually happens.' },
      { id: 'fairness', label: 'Fairness', description: 'Fairness — compare how outcomes differ across groups.' },
      { id: 'data-integrity', label: 'Data integrity', description: 'Data integrity — check the inputs for problems before blaming the model.' },
      { id: 'platform', label: 'Platform', description: 'Brought together in one investigation platform built with Flask.' },
    ] as ProjectFlowStep[],
    featured: true,
    problem:
      'When a model misbehaves, the cause can hide in several places: the data may have drifted, its confidence may be miscalibrated, its outcomes may be unfair across groups, or the input data itself may be broken.',
    approach: [
      'Drift — check whether the data a model sees has shifted.',
      'Calibration — check whether predicted confidence matches what actually happens.',
      'Fairness — compare how outcomes differ across groups.',
      'Data integrity — check the inputs for problems before blaming the model.',
      'Brought together in one investigation platform built with Flask.',
    ],
    stack: ['Python', 'Flask', 'Machine Learning', 'Data Science'],
    links: [
      { label: 'Demo video', href: 'https://youtu.be/0jthubG-RxY', kind: 'demo' },
    ],
  },
  {
    id: 'resume-analyzer',
    index: '02',
    title: 'AI Resume Analyzer',
    tagline: 'Desktop app for ATS scoring and job matching',
    summary: 'Scores resumes for ATS compatibility and matches them against job descriptions.',
    icon: 'resume',
    image: '/img/resume-analyzer.png',
    screenshots: [{ src: '/img/resume-analyzer.png', alt: 'AI Resume Analyzer' }],
    tags: ['Desktop app', 'ATS scoring', 'OCR', 'Gemini (optional)'],
    demoVideoUrl: 'https://youtu.be/mbyUxWVvyhA',
    flowSteps: [
      { id: 'ats-scoring', label: 'ATS scoring', description: 'ATS scoring to rate how a resume is likely to fare with applicant tracking systems.' },
      { id: 'job-matching', label: 'Job matching', description: 'Job matching to compare a resume against a role.' },
      { id: 'ocr', label: 'OCR', description: 'OCR so scanned and image-based resumes can be read too.' },
    ] as ProjectFlowStep[],
    problem:
      'Applicants often can’t tell how an applicant tracking system will read their resume, or how closely it matches a specific role.',
    approach: [
      'ATS scoring to rate how a resume is likely to fare with applicant tracking systems.',
      'Job matching to compare a resume against a role.',
      'OCR so scanned and image-based resumes can be read too.',
      'Optional Gemini integration for AI-assisted analysis.',
      'Packaged as a desktop application.',
    ],
    stack: ['Desktop app', 'ATS scoring', 'OCR', 'Gemini (optional)'],
    links: [
      { label: 'Demo video', href: 'https://youtu.be/mbyUxWVvyhA', kind: 'demo' },
    ],
  },
  {
    id: 'tripcraft',
    index: '03',
    title: 'TripCraft',
    tagline: 'AI-powered travel planner',
    summary: 'A MERN-style travel planner that uses Groq AI to help put trips together.',
    icon: 'tripcraft',
    image: '/img/tripcraft.png',
    screenshots: [{ src: '/img/tripcraft.png', alt: 'TripCraft' }],
    tags: ['MERN-style stack', 'React', 'Groq AI', 'JWT auth', 'Docker', 'CI/CD'],
    demoVideoUrl: 'https://youtu.be/5x4SO8GRVZE',
    flowSteps: [
      { id: 'full-stack', label: 'Full-stack', description: 'MERN-style full-stack architecture.' },
      { id: 'groq-ai', label: 'Groq AI', description: 'Groq AI for AI-assisted trip planning.' },
      { id: 'jwt-auth', label: 'JWT auth', description: 'JWT-based authentication for user accounts.' },
    ] as ProjectFlowStep[],
    problem: 'Planning a trip means juggling destinations, days and ideas in many different places.',
    approach: [
      'MERN-style full-stack architecture.',
      'Groq AI for AI-assisted trip planning.',
      'JWT-based authentication for user accounts.',
      'Containerised with Docker.',
      'CI/CD pipeline for automated builds and deployment.',
    ],
    stack: ['MERN-style stack', 'React', 'Groq AI', 'JWT auth', 'Docker', 'CI/CD'],
    links: [
      { label: 'Demo video', href: 'https://youtu.be/5x4SO8GRVZE', kind: 'demo' },
    ],
  },
]

const skillGroups = [
  { title: 'Languages', icon: 'code' as const, items: ['Python', 'Java', 'SQL'] },
  { title: 'AI & Data', icon: 'brain' as const, items: ['Machine Learning', 'Data Science'] },
  { title: 'Visualisation', icon: 'chart' as const, items: ['Power BI', 'Tableau'] },
  { title: 'Web', icon: 'globe' as const, items: ['React', 'Flask'] },
]

export const content = {
  site: {
    url: 'https://arman-kaushik-portfolio-e4b637.netlify.app',
    title: 'Arman Kaushik — AI/ML & Data Science Portfolio',
    description:
      'Portfolio of Arman Kaushik, a third-year B.Tech CSE student at SKIT Jaipur building machine learning and data projects. Open to AI/ML and data science internships.',
    jobTitle: 'B.Tech Computer Science & Engineering student',
    keywords: [
      'Arman Kaushik',
      'SKIT Jaipur',
      'AI/ML internship',
      'data science internship',
      'machine learning',
      'Python',
      'portfolio',
    ],
    locale: 'en_IN',
    /** 1200×630 PNG/JPG for link previews, e.g. "/og-image.png" in /public. */
    ogImage: '[OG_IMAGE_URL]',
  },

  certificates: [] as { id: string; title: string; issuer: string; year: string | number; type: string; file: string }[],

  person,

  ui: {
    skipToContent: 'Skip to content',
    openProject: 'Open project',
    close: 'Close',
    notSetYet: 'Link coming soon',
    resumeMissing: 'Resume link not added yet',
    emailMissing: 'Email address not added yet',
  },

  intro: {
    label: 'Loading portfolio',
    skip: 'Skip',
  },

  nav: {
    homeLabel: 'Arman Kaushik — home',
    items: [
      { id: 'about', label: 'About' },
      { id: 'skills', label: 'Skills' },
      { id: 'projects', label: 'Projects' },
      { id: 'journey', label: 'Journey' },
      { id: 'contact', label: 'Contact' },
    ],
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menuTitle: 'Menu',
    themeToLight: 'Switch to light mode',
    themeToDark: 'Switch to dark mode',
  },

  hero: {
    eyebrow: 'Open to AI/ML & data science internships',
    valueProp: 'Third-year CSE student at SKIT Jaipur, building machine learning and data tools.',
    primaryCta: 'View Projects',
    secondaryCta: 'Download Resume',
    scrollCue: 'Scroll',
    scrollCueLabel: 'Scroll to About',
  },

  about: {
    label: 'About',
    body: 'I’m Arman, a third-year B.Tech Computer Science student at SKIT Jaipur. I build with machine learning and data — from a platform that investigates why models fail, to an AI resume analyzer and an AI travel planner. Now I’m looking for AI/ML and data science internships.',
    highlights: ['machine', 'learning', 'data', 'AI/ML', 'science', 'internships'],
    stats: [
      { value: 3, label: 'Portfolio projects' },
      { value: 224, label: 'GitHub contributions in the last year' },
    ],
    status: {
      title: 'Currently',
      lines: ['3rd year · B.Tech CSE', 'SKIT Jaipur · 2024 – 2028', 'Open to AI/ML & data science internships'],
    },
  },

  skills: {
    label: 'Skills',
    title: 'Tools I work with.',
    subtitle: 'From data and models to dashboards and the apps around them.',
    groups: skillGroups,
  },

  projects: {
    label: 'Projects',
    title: 'Selected work.',
    subtitle: 'Three projects across ML tooling, applied AI and full-stack development. Tap one to open it.',
    items: projects,
    sections: { problem: 'The problem', approach: 'Approach', stack: 'Stack', links: 'Links' },
  },

  journey: {
    label: 'Journey',
    title: 'So far.',
    items: [
      {
        id: 'education',
        date: '2024 – 2028',
        title: person.degree,
        kicker: person.college,
        text: 'Currently in my third year.',
        type: 'education' as const,
      },
      {
        id: 'feynml',
        title: 'Built FeynML',
        kicker: 'Project',
        text: 'An ML failure investigation platform covering drift, calibration, fairness and data integrity.',
        type: 'project' as const,
      },
      {
        id: 'resume-analyzer',
        title: 'Built AI Resume Analyzer',
        kicker: 'Project',
        text: 'A desktop app for ATS scoring and job matching, with OCR and optional Gemini support.',
        type: 'project' as const,
      },
      {
        id: 'tripcraft',
        title: 'Built TripCraft',
        kicker: 'Project',
        text: 'A MERN-style travel planner with Groq AI, JWT auth, Docker and CI/CD.',
        type: 'project' as const,
      },
      {
        id: 'internship',
        date: 'Now',
        title: 'Looking for an internship',
        kicker: 'AI/ML · Data Science',
        text: 'Seeking AI/ML and data science internship opportunities.',
        type: 'next' as const,
      },
    ] satisfies JourneyItem[],
  },

  github: {
    title: 'On GitHub',
    stat: '224 contributions in the last year',
    cta: 'View profile',
    pinnedLabel: 'Pinned',
    pinned: projects.map((p) => ({
      name: p.title,
      description: p.summary,
      tags: p.stack.slice(0, 3),
      url: p.links.find((l) => l.kind === 'repo')?.href ?? '',
    })),
  },

  contact: {
    label: 'Contact',
    title: 'Let’s talk.',
    subtitle: 'Have an AI/ML or data science internship opening? I’d love to hear from you.',
    emailLabel: 'Email',
    copy: 'Copy',
    copied: 'Copied',
    copiedToast: 'Email copied to clipboard',
    copyFailedToast: 'Couldn’t copy — please select the address instead',
    elsewhere: 'Elsewhere',
    socials: [
      { label: 'GitHub', handle: `@${person.githubUsername}`, href: person.socials.github, icon: 'github' as const },
      { label: 'LinkedIn', handle: person.name, href: person.socials.linkedin, icon: 'linkedin' as const },
    ],
    form: {
      title: 'Send a message',
      name: 'Your name',
      namePlaceholder: 'Jane Doe',
      subject: 'Subject',
      subjectPlaceholder: 'Internship opportunity',
      message: 'Message',
      messagePlaceholder: 'Tell me a little about the role or idea…',
      submit: 'Open in mail app',
      note: 'This opens your email app with the message ready to send.',
      defaultSubject: 'Hello from your portfolio',
      openedToast: 'Opening your mail app…',
    },
  },

  footer: {
    tagline: 'Designed and built by Arman Kaushik.',
    backToTop: 'Back to top',
  },
}
