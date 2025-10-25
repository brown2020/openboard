import { BoardTemplate } from "@/types";

export const BOARD_TEMPLATES: BoardTemplate[] = [
  {
    id: "creator-basic",
    name: "Creator Starter",
    description: "Perfect for content creators getting started",
    category: "creator",
    thumbnail: "/templates/creator-basic.jpg",
    featured: true,
    usageCount: 1250,
    theme: {
      name: "Creator Theme",
      background: {
        type: "gradient",
        value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      primaryColor: "#667eea",
      textColor: "#ffffff",
      cardBackground: "rgba(255, 255, 255, 0.15)",
      borderRadius: "lg",
      font: {
        heading: "system-ui",
        body: "system-ui",
      },
    },
    blocks: [
      {
        type: "text",
        order: 0,
        visible: true,
        settings: {
          content: "Hey! Check out all my links 👇",
          alignment: "center",
          fontSize: "lg",
        },
      },
      {
        type: "link",
        order: 1,
        visible: true,
        settings: {
          title: "Latest Video",
          url: "https://youtube.com",
          description: "Watch my newest content!",
          icon: "🎥",
        },
      },
      {
        type: "link",
        order: 2,
        visible: true,
        settings: {
          title: "Instagram",
          url: "https://instagram.com",
          icon: "📸",
        },
      },
      {
        type: "link",
        order: 3,
        visible: true,
        settings: {
          title: "TikTok",
          url: "https://tiktok.com",
          icon: "🎵",
        },
      },
      {
        type: "button",
        order: 4,
        visible: true,
        settings: {
          text: "Subscribe to Newsletter",
          url: "https://newsletter.example.com",
          style: "primary",
          size: "lg",
        },
      },
    ],
  },
  {
    id: "developer-portfolio",
    name: "Developer Portfolio",
    description: "Showcase your projects and skills",
    category: "developer",
    thumbnail: "/templates/developer.jpg",
    featured: true,
    usageCount: 890,
    theme: {
      name: "Developer Theme",
      background: {
        type: "color",
        value: "#0a0a0a",
      },
      primaryColor: "#00ff88",
      textColor: "#ffffff",
      cardBackground: "#1a1a1a",
      cardBorder: "#00ff88",
      borderRadius: "md",
      font: {
        heading: "system-ui",
        body: "system-ui",
      },
    },
    blocks: [
      {
        type: "text",
        order: 0,
        visible: true,
        settings: {
          content: "Full-Stack Developer • Open Source Enthusiast",
          alignment: "center",
          fontSize: "md",
        },
      },
      {
        type: "divider",
        order: 1,
        visible: true,
        settings: {
          style: "solid",
          width: "medium",
        },
      },
      {
        type: "link",
        order: 2,
        visible: true,
        settings: {
          title: "GitHub",
          url: "https://github.com",
          description: "View my open source projects",
          icon: "💻",
        },
      },
      {
        type: "link",
        order: 3,
        visible: true,
        settings: {
          title: "Portfolio Website",
          url: "https://example.com",
          description: "See my work and case studies",
          icon: "🌐",
        },
      },
      {
        type: "link",
        order: 4,
        visible: true,
        settings: {
          title: "Blog",
          url: "https://blog.example.com",
          description: "Read my technical articles",
          icon: "✍️",
        },
      },
      {
        type: "button",
        order: 5,
        visible: true,
        settings: {
          text: "Contact Me",
          url: "mailto:hello@example.com",
          style: "outline",
          size: "md",
        },
      },
    ],
  },
  {
    id: "business-minimal",
    name: "Business Minimal",
    description: "Clean and professional for businesses",
    category: "business",
    thumbnail: "/templates/business.jpg",
    featured: true,
    usageCount: 650,
    theme: {
      name: "Business Theme",
      background: {
        type: "color",
        value: "#fafafa",
      },
      primaryColor: "#171717",
      textColor: "#171717",
      cardBackground: "#ffffff",
      cardBorder: "#e5e5e5",
      borderRadius: "sm",
      font: {
        heading: "system-ui",
        body: "system-ui",
      },
    },
    blocks: [
      {
        type: "text",
        order: 0,
        visible: true,
        settings: {
          content: "Welcome to Our Company",
          alignment: "center",
          fontSize: "xl",
        },
      },
      {
        type: "text",
        order: 1,
        visible: true,
        settings: {
          content: "Quality products and services since 2020",
          alignment: "center",
          fontSize: "md",
        },
      },
      {
        type: "spacer",
        order: 2,
        visible: true,
        settings: {
          height: "md",
        },
      },
      {
        type: "link",
        order: 3,
        visible: true,
        settings: {
          title: "Our Products",
          url: "https://example.com/products",
          description: "Browse our product catalog",
        },
      },
      {
        type: "link",
        order: 4,
        visible: true,
        settings: {
          title: "About Us",
          url: "https://example.com/about",
          description: "Learn about our story",
        },
      },
      {
        type: "link",
        order: 5,
        visible: true,
        settings: {
          title: "Contact",
          url: "https://example.com/contact",
          description: "Get in touch with our team",
        },
      },
      {
        type: "button",
        order: 6,
        visible: true,
        settings: {
          text: "Book a Consultation",
          url: "https://calendly.com",
          style: "primary",
          size: "lg",
        },
      },
    ],
  },
  {
    id: "student-linktree",
    name: "Student Links",
    description: "Perfect for students and academics",
    category: "student",
    thumbnail: "/templates/student.jpg",
    featured: false,
    usageCount: 420,
    theme: {
      name: "Student Theme",
      background: {
        type: "gradient",
        value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      },
      primaryColor: "#f5576c",
      textColor: "#ffffff",
      cardBackground: "rgba(255, 255, 255, 0.2)",
      borderRadius: "lg",
      font: {
        heading: "system-ui",
        body: "system-ui",
      },
    },
    blocks: [
      {
        type: "text",
        order: 0,
        visible: true,
        settings: {
          content: "📚 Computer Science Student | Class of 2025",
          alignment: "center",
          fontSize: "md",
        },
      },
      {
        type: "link",
        order: 1,
        visible: true,
        settings: {
          title: "Resume",
          url: "https://example.com/resume.pdf",
          description: "Download my CV",
          icon: "📄",
        },
      },
      {
        type: "link",
        order: 2,
        visible: true,
        settings: {
          title: "LinkedIn",
          url: "https://linkedin.com",
          icon: "💼",
        },
      },
      {
        type: "link",
        order: 3,
        visible: true,
        settings: {
          title: "Projects",
          url: "https://github.com",
          description: "Check out my work",
          icon: "🚀",
        },
      },
      {
        type: "link",
        order: 4,
        visible: true,
        settings: {
          title: "Research Paper",
          url: "https://example.com/paper",
          icon: "🔬",
        },
      },
    ],
  },
  {
    id: "team-resources",
    name: "Team Resources",
    description: "Centralized hub for team links",
    category: "team",
    thumbnail: "/templates/team.jpg",
    featured: false,
    usageCount: 310,
    theme: {
      name: "Team Theme",
      background: {
        type: "color",
        value: "#ffffff",
      },
      primaryColor: "#3b82f6",
      textColor: "#1e293b",
      cardBackground: "#f8fafc",
      cardBorder: "#e2e8f0",
      borderRadius: "md",
      font: {
        heading: "system-ui",
        body: "system-ui",
      },
    },
    blocks: [
      {
        type: "text",
        order: 0,
        visible: true,
        settings: {
          content: "Team Resources Hub",
          alignment: "center",
          fontSize: "xl",
        },
      },
      {
        type: "divider",
        order: 1,
        visible: true,
        settings: {
          style: "solid",
          width: "full",
        },
      },
      {
        type: "link",
        order: 2,
        visible: true,
        settings: {
          title: "Project Board",
          url: "https://trello.com",
          description: "View current tasks",
          icon: "📋",
        },
      },
      {
        type: "link",
        order: 3,
        visible: true,
        settings: {
          title: "Documentation",
          url: "https://notion.com",
          description: "Team wiki and docs",
          icon: "📚",
        },
      },
      {
        type: "link",
        order: 4,
        visible: true,
        settings: {
          title: "Slack Channel",
          url: "https://slack.com",
          description: "Team communication",
          icon: "💬",
        },
      },
      {
        type: "link",
        order: 5,
        visible: true,
        settings: {
          title: "Calendar",
          url: "https://calendar.google.com",
          description: "Shared team calendar",
          icon: "📅",
        },
      },
    ],
  },
];
