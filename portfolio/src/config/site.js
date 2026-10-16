// Edit your personal details here — every component reads from this file.
import jobnestShot from '../assets/projects/jobnest.webp'
import julyShot from '../assets/projects/july-smriti.webp'
export const site = {
  firstName: 'Takwa',
  middleName: 'Jahin',
  lastName: 'Feeza',
  role: ['Frontend developer', 'React · MERN · WebGL'],
  education: 'CSE · AUST · 2026',
  location: 'Bangladesh',
  timeZone: 'Asia/Dhaka',
  status: 'Open to internships & entry-level roles',
  intro:
    'I build fast, interactive web apps with React and the MERN stack — then bring them to life with motion, GSAP and Three.js.',
  resumeUrl: '/resume.pdf', // put your CV in /public/resume.pdf
  email: 'takwafeeza84@gmail.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/feeza-T' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/takwa-jahin-feeza-8643a3325' },
    { label: 'Behance', href: 'https://www.behance.net/takwafeeza' },
  ],
  heroStack: ['React', 'Node.js', 'MongoDB', 'GSAP', 'Three.js'],

  nav: [
    // `href` = a section on the home page, `to` = its own page
    { label: 'Home', href: '#home' },
    { label: 'Skills', href: '#skills' },
    { label: 'Work', to: '/projects' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],

  // `icon` = a simple-icons export name (see components/Skills/icons.js). Leave it
  // out to show a lettered badge instead.
  skills: [
    { name: 'HTML', icon: 'siHtml5' },
    { name: 'CSS', icon: 'siCss' },
    { name: 'JavaScript', icon: 'siJavascript' },
    { name: 'React', icon: 'siReact' },
    { name: 'Node.js', icon: 'siNodedotjs' },
    { name: 'Express', icon: 'siExpress' },
    { name: 'MongoDB', icon: 'siMongodb' },
    { name: 'Firebase', icon: 'siFirebase' },
    { name: 'Tailwind CSS', icon: 'siTailwindcss' },
    { name: 'GSAP', icon: 'siGsap' },
    { name: 'Three.js', icon: 'siThreedotjs' },
    { name: 'Motion' },
    { name: 'Vite', icon: 'siVite' },
    { name: 'Git', icon: 'siGit' },
    { name: 'GitHub', icon: 'siGithub' },
    { name: 'Framer', icon: 'siFramer' },
    { name: 'Figma', icon: 'siFigma' },
    { name: 'Canva' },
  ],

  // Your projects (from your resume). Screenshots live in src/assets/projects/ —
  // import them at the top of this file and set `image`. No image = a designed
  // "coming soon" card (EspressoEcho until it's deployed).
  projects: [
    {
      title: 'JobNest',
      slug: 'jobnest',
      titleParts: ['Job', 'Nest'],
      subtitle: 'Freelance job marketplace',
      type: 'Full-stack · Solo project',
      role: 'Solo — design & full-stack development',
      blurb:
        'A marketplace where clients post jobs and freelancers bid. Bids move through Pending → In Progress → Complete or Rejected, behind Firebase Google Sign-In and JWT-protected Express APIs.',
      points: [
        'Search, filters, sorting & pagination cached with TanStack Query',
        'Page and component motion with GSAP and Framer Motion',
      ],
      stack: ['React', 'Tailwind CSS', 'TanStack Query', 'Firebase Auth', 'GSAP', 'Node.js', 'Express', 'MongoDB', 'JWT'],
      live: 'https://job-nest-6bkq.vercel.app/',
      code: 'https://github.com/feeza-T/JobNest',
      theme: { bg: '#F5B83D', bg2: '#FEE08B', ink: '#120C08', accent: '#C2060F' },
      mark: 'JN',
      image: jobnestShot,
    },
    {
      title: 'July Smriti',
      slug: 'july-smriti',
      titleParts: ['July', 'Smriti'],
      subtitle: 'Archive of July 2024',
      type: 'Team project · Frontend',
      role: 'Frontend developer in a 3-member AUST team',
      blurb:
        'A bilingual platform preserving July 2024 records and evidence, with assistance and missing-person workflows.',
      points: [
        'Reusable React UI with routed flows and Redux Toolkit state',
        'Integrated media uploads, maps, notifications and draft saving with the team',
      ],
      stack: ['React 18', 'React Router 6', 'Redux Toolkit', 'Tailwind CSS', 'Framer Motion'],
      live: 'https://july-srity.vercel.app/',
      code: 'https://github.com/Z-i-n-k-s/july-srity-project',
      theme: { bg: '#171516', bg2: '#2A1012', ink: '#F1EDE4', accent: '#E5322A' },
      mark: 'JS',
      image: julyShot,
    },
    {
      title: 'EspressoEcho',
      slug: 'espressoecho',
      titleParts: ['Espresso', 'Echo'],
      subtitle: 'Café management system',
      type: 'Team project · Frontend',
      role: 'Frontend developer',
      blurb:
        'Role-based interfaces for customers, owners, managers, cashiers and staff across a multi-branch café.',
      points: [
        'Menu, cart & orders, branches, offers and feedback flows',
        'Operational dashboards connected to an ASP.NET Core + PostgreSQL backend',
      ],
      stack: ['React', 'shadcn/ui', 'ASP.NET Core', 'PostgreSQL'],
      live: null,
      code: 'https://github.com/Z-i-n-k-s/EspressoEcho-asp.net-project-with-react-shadcn',
      theme: { bg: '#3B2416', bg2: '#5A3721', ink: '#F3E3CC', accent: '#E39A55' },
      mark: 'EE',
      status: 'Deploying soon',
    },
  ],

  // ---- About section (from your two resumes) ----
  about: {
    statement:
      "I'm Takwa — a final-year CSE student at AUST who builds responsive React apps, brings them to life with GSAP and Framer Motion, and designs them first in Figma. I care about the place where code meets people: clear flows, honest details and interfaces that feel good to use.",
    stats: [
      { value: 3.496, decimals: 3, label: 'CGPA', note: 'B.Sc. in CSE · AUST' },
      { value: 5, decimals: 2, label: 'HSC GPA', note: 'out of 5.00 · Dhaka City College' },
      { value: 1, decimals: 0, prefix: '#', label: 'UAP Hackathon', note: '1st place · Frontend track' },
      { value: 3, decimals: 0, label: 'Projects', note: '1 solo full-stack · 2 team frontends' },
    ],
    modes: [
      {
        title: 'Design',
        line: 'Figma first',
        body: 'User flows, low- and high-fidelity wireframes, design systems with Figma Variables and clickable prototypes.',
      },
      {
        title: 'Build',
        line: 'React to MongoDB',
        body: 'React, Tailwind, TanStack Query and Redux Toolkit on the front; Node, Express, MongoDB, Firebase Auth and JWT behind it.',
      },
      {
        title: 'Motion',
        line: 'Movement with meaning',
        body: 'GSAP, Framer Motion and Three.js — animation that guides attention and makes interfaces feel alive, never in the way.',
      },
      {
        title: 'Product',
        line: 'Why before how',
        body: 'MVP scoping, prioritisation, user stories with acceptance criteria and traced UAT test cases.',
      },
    ],
    timeline: [
      { when: 'HSC', title: 'Dhaka City College', text: 'Higher Secondary Certificate — GPA 5.00 / 5.00.' },
      { when: 'B.Sc.', title: 'AUST — Computer Science & Engineering', text: 'CGPA 3.496 · graduating November 2026.' },
      { when: 'Award', title: '1st Place — UAP Hackathon', text: 'Won the frontend track with a hand-built HTML & vanilla CSS interface.' },
      { when: 'Sep 2026', title: 'Product Management 101', text: 'Simplilearn SkillUp certification.' },
      { when: 'Oct 2026', title: 'Product case studies', text: 'Atlas People and ClassLoop — designed, documented and published.' },
    ],
  },

  // ---- Beyond code: product design & PM case studies ----
  caseStudies: [
    {
      title: 'Atlas People',
      kind: 'Product Design',
      date: 'Oct 2026',
      text: 'A dual-role time-off experience for HR and employees — AI-assisted first draft, then a human-refined redesign with five documented UX decisions and a Figma Variables design system.',
      tools: ['Figma', 'Variables', 'Prototyping'],
      href: 'https://www.behance.net/gallery/257012763/Atlas-People-Designing-Time-Off-for-HR-and-Employees',
      where: 'Behance',
    },
    {
      title: 'Turf Ground Booking',
      kind: 'Product Management',
      date: 'Sep 2026',
      text: 'Scoped a guest-booking MVP for a local turf: customer and manager flows, 20 wireframes, 8 user stories and 28 traced UAT test cases.',
      tools: ['Figma', 'Google Sheets', 'Notion'],
      href: 'https://sphenoid-grape-a4a.notion.site/Turf-Ground-Booking-System-PM-Case-Study-3f79b0e2726881b48ba2d69ade48a198',
      where: 'Notion',
    },
    {
      title: 'ClassLoop',
      kind: 'Concept Product',
      date: 'Oct 2026',
      text: 'One place for class cancellations, room changes and makeup classes — impact/effort prioritisation, success metrics and four high-fidelity mobile screens.',
      tools: ['Figma', 'Notion'],
      href: 'https://sphenoid-grape-a4a.notion.site/ClassLoop-Concept-Product-Case-Study-3f79b0e272688127958bf1f0666fcde2',
      where: 'Notion',
    },
  ],

  // Speech bubbles for the avatar scene, one per pose.
  avatarLines: [
    "Hi, I'm Takwa!",
    'I turn ideas into interfaces.',
    'With a little bit of mischief…',
    'Smooth animations make me jump.',
    "Wait — you haven't seen my work?",
    'Bye! Scroll for projects ↓',
  ],
}

export const fullName = `${site.firstName} ${site.middleName} ${site.lastName}`
