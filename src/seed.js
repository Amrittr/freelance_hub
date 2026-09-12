import bcrypt from "bcryptjs";
import { connectDatabase } from "./config/db.js";
import { User } from "./models/User.js";
import { Service } from "./models/Service.js";
import { Order } from "./models/Order.js";
import { WalletTransaction } from "./models/WalletTransaction.js";
import { Message } from "./models/Message.js";

const seedPassword = "FreelanceHub123!";

const sellers = [
  {
    name: "Priya Sharma",
    email: "priya@freelancehub.local",
    profile: { headline: "UI/UX Designer", skills: ["Figma", "UI Design", "Prototyping"] },
    services: [
      {
        title: "I will design a modern landing page in Figma",
        category: "design",
        description: "Get a high-converting, modern landing page design for your SaaS or app. I will provide the Figma source file.",
        price: 8000,
        deliveryDays: 3,
        revisions: 2,
        tags: ["ui/ux", "figma", "landing page"],
        icon: "pen-tool",
        coverTheme: "theme-design",
        ratingAverage: 4.9,
        ratingCount: 120,
      },
      {
        title: "I will do a complete UX audit of your mobile app",
        category: "design",
        description: "I will review your app screens and provide a detailed UX audit report with actionable improvements.",
        price: 5000,
        deliveryDays: 2,
        revisions: 1,
        tags: ["ux", "audit", "mobile app"],
        icon: "search",
        coverTheme: "theme-design",
        ratingAverage: 4.8,
        ratingCount: 55,
      }
    ]
  },
  {
    name: "Arjun Patel",
    email: "arjun@freelancehub.local",
    profile: { headline: "Full-Stack Developer", skills: ["React", "Node.js", "MongoDB"] },
    services: [
      {
        title: "I will build a full-stack web application with React and Node",
        category: "tech",
        description: "Custom web application development from scratch. Secure, scalable, and responsive.",
        price: 15000,
        deliveryDays: 14,
        revisions: 3,
        tags: ["react", "node", "fullstack"],
        icon: "code-2",
        coverTheme: "theme-tech",
        ratingAverage: 5.0,
        ratingCount: 200,
      }
    ]
  },
  {
    name: "Neha Gupta",
    email: "neha@freelancehub.local",
    profile: { headline: "Content Marketing Strategist", skills: ["SEO Content", "Strategy", "Social Media"] },
    services: [
      {
        title: "I will write 4 SEO optimized blog posts",
        category: "marketing",
        description: "High-quality, engaging, and SEO optimized articles for your blog. 1000 words each.",
        price: 4500,
        deliveryDays: 5,
        revisions: 1,
        tags: ["seo", "blogging", "content marketing"],
        icon: "megaphone",
        coverTheme: "theme-marketing",
        ratingAverage: 4.7,
        ratingCount: 89,
      }
    ]
  },
  {
    name: "Vikram Reddy",
    email: "vikram@freelancehub.local",
    profile: { headline: "Video Editor & Animator", skills: ["Premiere Pro", "After Effects", "YouTube"] },
    services: [
      {
        title: "I will edit your YouTube videos professionally",
        category: "video",
        description: "Crisp cuts, color grading, motion graphics, and sound design for your YouTube channel.",
        price: 3000,
        deliveryDays: 2,
        revisions: 2,
        tags: ["youtube", "editing", "video"],
        icon: "clapperboard",
        coverTheme: "theme-video",
        ratingAverage: 4.95,
        ratingCount: 305,
      }
    ]
  },
  {
    name: "Ananya Iyer",
    email: "ananya@freelancehub.local",
    profile: { headline: "AI/ML Engineer", skills: ["Python", "TensorFlow", "OpenAI API"] },
    services: [
      {
        title: "I will build a custom AI chatbot using OpenAI",
        category: "ai",
        description: "A tailored AI assistant trained on your custom data for customer support or internal use.",
        price: 12000,
        deliveryDays: 7,
        revisions: 2,
        tags: ["ai", "chatbot", "openai"],
        icon: "bot",
        coverTheme: "theme-ai",
        ratingAverage: 4.88,
        ratingCount: 42,
      }
    ]
  },
  {
    name: "Rohan Mehta",
    email: "rohan@freelancehub.local",
    profile: { headline: "B2B SaaS Copywriter", skills: ["Copywriting", "Sales Pages", "Email Sequences"] },
    services: [
      {
        title: "I will write high-converting email sequences",
        category: "writing",
        description: "A 5-part email sequence designed to convert your leads into paying customers.",
        price: 6000,
        deliveryDays: 4,
        revisions: 1,
        tags: ["email", "copywriting", "sales"],
        icon: "file-pen-line",
        coverTheme: "theme-writing",
        ratingAverage: 4.92,
        ratingCount: 156,
      }
    ]
  },
  {
    name: "Aarti Desai",
    email: "aarti@freelancehub.local",
    profile: { headline: "Business Consultant", skills: ["Strategy", "Financial Modeling", "Pitch Decks"] },
    services: [
      {
        title: "I will create a financial model for your startup",
        category: "business",
        description: "Comprehensive 3-year financial projections to help you secure funding.",
        price: 9000,
        deliveryDays: 5,
        revisions: 2,
        tags: ["finance", "startup", "modeling"],
        icon: "briefcase-business",
        coverTheme: "theme-business",
        ratingAverage: 4.75,
        ratingCount: 34,
      }
    ]
  },
  {
    name: "Karan Singh",
    email: "karan@freelancehub.local",
    profile: { headline: "Mobile App Dev", skills: ["Flutter", "Dart", "Firebase"] },
    services: [
      {
        title: "I will develop a cross-platform mobile app in Flutter",
        category: "tech",
        description: "End-to-end mobile app development for iOS and Android using Flutter.",
        price: 18000,
        deliveryDays: 20,
        revisions: 3,
        tags: ["flutter", "mobile", "app dev"],
        icon: "code-2",
        coverTheme: "theme-tech",
        ratingAverage: 4.98,
        ratingCount: 110,
      }
    ]
  },
  {
    name: "Sanya Kapoor",
    email: "sanya@freelancehub.local",
    profile: { headline: "Social Media Manager", skills: ["Instagram", "Content Creation", "Growth"] },
    services: [
      {
        title: "I will manage your Instagram for 30 days",
        category: "marketing",
        description: "Daily posts, stories, engagement, and growth strategies for your brand.",
        price: 8500,
        deliveryDays: 30,
        revisions: 0,
        tags: ["instagram", "social media", "management"],
        icon: "megaphone",
        coverTheme: "theme-marketing",
        ratingAverage: 4.85,
        ratingCount: 220,
      }
    ]
  },
  {
    name: "Rahul Verma",
    email: "rahul@freelancehub.local",
    profile: { headline: "3D Artist", skills: ["Blender", "Maya", "3D Modeling"] },
    services: [
      {
        title: "I will create a 3D product animation",
        category: "video",
        description: "Photorealistic 3D rendering and animation for your product marketing.",
        price: 10000,
        deliveryDays: 7,
        revisions: 2,
        tags: ["3d", "animation", "blender"],
        icon: "clapperboard",
        coverTheme: "theme-video",
        ratingAverage: 4.9,
        ratingCount: 78,
      }
    ]
  },
  {
    name: "Sneha Nair",
    email: "sneha@freelancehub.local",
    profile: { headline: "Technical Writer", skills: ["Documentation", "API Docs", "Markdown"] },
    services: [
      {
        title: "I will write clear API documentation",
        category: "writing",
        description: "Developer-friendly API docs with code examples and clear explanations.",
        price: 5500,
        deliveryDays: 4,
        revisions: 1,
        tags: ["api", "documentation", "technical writing"],
        icon: "file-pen-line",
        coverTheme: "theme-writing",
        ratingAverage: 4.93,
        ratingCount: 92,
      }
    ]
  },
  {
    name: "Amit Joshi",
    email: "amit@freelancehub.local",
    profile: { headline: "Virtual Assistant", skills: ["Data Entry", "Admin", "Research"] },
    services: [
      {
        title: "I will be your reliable virtual assistant for a week",
        category: "business",
        description: "Data entry, email management, scheduling, and general admin tasks. 20 hours.",
        price: 4000,
        deliveryDays: 7,
        revisions: 0,
        tags: ["va", "admin", "data entry"],
        icon: "briefcase-business",
        coverTheme: "theme-business",
        ratingAverage: 4.8,
        ratingCount: 310,
      }
    ]
  },
  {
    name: "Pooja Das",
    email: "pooja@freelancehub.local",
    profile: { headline: "Data Scientist", skills: ["Python", "SQL", "Tableau"] },
    services: [
      {
        title: "I will create interactive data dashboards in Tableau",
        category: "tech",
        description: "Transform your raw data into actionable insights with beautiful Tableau dashboards.",
        price: 7500,
        deliveryDays: 5,
        revisions: 2,
        tags: ["data", "tableau", "dashboard"],
        icon: "code-2",
        coverTheme: "theme-tech",
        ratingAverage: 4.96,
        ratingCount: 88,
      }
    ]
  },
  {
    name: "Vivek Menon",
    email: "vivek@freelancehub.local",
    profile: { headline: "Voice Over Artist", skills: ["Voice Acting", "Audio Editing", "Hindi/English"] },
    services: [
      {
        title: "I will record a professional Hindi/English voice over",
        category: "video",
        description: "High-quality audio recording for commercials, explainer videos, or audiobooks.",
        price: 2500,
        deliveryDays: 2,
        revisions: 1,
        tags: ["voice over", "audio", "hindi"],
        icon: "clapperboard",
        coverTheme: "theme-video",
        ratingAverage: 4.99,
        ratingCount: 450,
      }
    ]
  },
  {
    name: "Nidhi Agarwal",
    email: "nidhi@freelancehub.local",
    profile: { headline: "Brand Identity Expert", skills: ["Illustrator", "Branding", "Logo Design"] },
    services: [
      {
        title: "I will design a timeless minimalist logo",
        category: "design",
        description: "A memorable, minimalist logo design with source files and brand guidelines.",
        price: 6500,
        deliveryDays: 4,
        revisions: 3,
        tags: ["logo", "minimalist", "branding"],
        icon: "pen-tool",
        coverTheme: "theme-design",
        ratingAverage: 4.87,
        ratingCount: 175,
      }
    ]
  },
  {
    name: "Siddharth Bose",
    email: "siddharth@freelancehub.local",
    profile: { headline: "SEO Specialist", skills: ["Link Building", "On-Page SEO", "Ahrefs"] },
    services: [
      {
        title: "I will build high DA backlinks for your site",
        category: "marketing",
        description: "Manual, high-quality backlink building to improve your domain authority and rankings.",
        price: 5000,
        deliveryDays: 10,
        revisions: 0,
        tags: ["seo", "backlinks", "marketing"],
        icon: "megaphone",
        coverTheme: "theme-marketing",
        ratingAverage: 4.6,
        ratingCount: 65,
      }
    ]
  },
  {
    name: "Kavita Rao",
    email: "kavita@freelancehub.local",
    profile: { headline: "Prompt Engineer", skills: ["ChatGPT", "Midjourney", "Prompt Design"] },
    services: [
      {
        title: "I will design advanced prompts for Midjourney/ChatGPT",
        category: "ai",
        description: "Get highly optimized prompts to generate exactly what you need from AI tools.",
        price: 1500,
        deliveryDays: 1,
        revisions: 1,
        tags: ["prompts", "midjourney", "chatgpt"],
        icon: "bot",
        coverTheme: "theme-ai",
        ratingAverage: 4.95,
        ratingCount: 112,
      }
    ]
  },
  {
    name: "Tariq Khan",
    email: "tariq@freelancehub.local",
    profile: { headline: "Legal Consultant", skills: ["Contracts", "Terms of Service", "Privacy Policies"] },
    services: [
      {
        title: "I will draft a standard NDA and Terms of Service",
        category: "business",
        description: "Legally sound documents tailored for your startup or freelance business.",
        price: 8000,
        deliveryDays: 3,
        revisions: 1,
        tags: ["legal", "contract", "tos"],
        icon: "briefcase-business",
        coverTheme: "theme-business",
        ratingAverage: 4.9,
        ratingCount: 48,
      }
    ]
  }
];

const clients = [
  { name: "TechNova Solutions", email: "tech@technova.local", amount: 50000 },
  { name: "GreenLeaf Ventures", email: "hello@greenleaf.local", amount: 25000 },
  { name: "Urban Threads", email: "contact@urbanthreads.local", amount: 15000 },
  { name: "NextGen AI", email: "founder@nextgenai.local", amount: 80000 },
];

async function main() {
  await connectDatabase();

  await User.deleteMany({});
  await Service.deleteMany({});
  await Order.deleteMany({});
  await WalletTransaction.deleteMany({});
  await Message.deleteMany({});

  const passwordHash = await bcrypt.hash(seedPassword, 12);
  const sellerDocs = [];
  const serviceDocs = [];

  for (const seller of sellers) {
    const user = await User.create({
      name: seller.name,
      email: seller.email,
      passwordHash,
      roles: ["freelancer", "client"],
      activeRole: "freelancer",
      profile: seller.profile,
    });
    sellerDocs.push(user);

    for (const service of seller.services) {
      const s = await Service.create({
        ...service,
        seller: user._id,
        status: "active",
      });
      serviceDocs.push(s);
    }
  }

  const clientDocs = [];
  for (const client of clients) {
    const user = await User.create({
      name: client.name,
      email: client.email,
      passwordHash,
      roles: ["client"],
      activeRole: "client",
      profile: { headline: "Client account" },
    });
    clientDocs.push(user);

    await WalletTransaction.create({
      user: user._id,
      amount: client.amount,
      direction: "credit",
      status: "succeeded",
      type: "top_up",
      paymentProvider: "demo",
      description: "Initial demo top-up",
    });
  }

  // Create some orders
  const statuses = ["funded", "in_progress", "submitted", "revision_requested", "completed"];
  
  for (let i = 0; i < 25; i++) {
    const client = clientDocs[Math.floor(Math.random() * clientDocs.length)];
    const service = serviceDocs[Math.floor(Math.random() * serviceDocs.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const order = await Order.create({
      client: client._id,
      freelancer: service.seller,
      service: service._id,
      title: `${service.title} - Project`,
      requirements: "Please follow the standard guidelines and ensure high quality delivery.",
      amount: service.price,
      freelancerAmount: service.price * 0.88, // 12% fee
      platformFee: service.price * 0.12,
      paymentStatus: "paid",
      status,
      dueAt: new Date(Date.now() + service.deliveryDays * 86400000),
    });

    if (status === "completed") {
      await WalletTransaction.create({
        user: service.seller,
        amount: order.freelancerAmount,
        direction: "credit",
        status: "succeeded",
        type: "adjustment",
        paymentProvider: "demo",
        description: `Payout for order ${order._id}`,
      });
    }

    // Add a message
    await Message.create({
      order: order._id,
      sender: client._id,
      recipient: service.seller,
      body: "Looking forward to seeing the results!",
    });
  }

  // 1. Seed Ashish Shankar (Freelancer)
  const ashish = await User.create({
    name: "Ashish Shankar",
    email: "ashish@freelancehub.local",
    passwordHash,
    roles: ["freelancer", "client"],
    activeRole: "freelancer",
    profile: {
      headline: "Senior Full-Stack Developer",
      bio: "Full-stack developer with 6+ years of experience building secure, scalable Node.js/Express APIs and modern React frontends.",
      skills: ["Node.js", "React", "Express", "MongoDB", "AWS", "TypeScript"],
      country: "India",
      specialty: "Full-Stack Development",
      experienceLevel: "Senior",
      availability: "Available",
      avatarColor: "#2d805e"
    },
    onboarding: {
      roleChoiceComplete: true,
      freelancerComplete: true,
      clientComplete: true,
    }
  });

  const ashishServices = [
    {
      title: "I will build a high-performance REST API with Node.js & Express",
      category: "tech",
      description: "Get a secure, scalable, and fully documented REST API built using Node.js, Express, and MongoDB. Includes clean architecture and JWT authentication.",
      price: 12000,
      deliveryDays: 5,
      revisions: 3,
      tags: ["nodejs", "express", "api"],
      icon: "code-2",
      coverTheme: "theme-tech",
      ratingAverage: 5.0,
      ratingCount: 15,
      status: "active",
      seller: ashish._id
    },
    {
      title: "I will deploy your Web App on AWS or Vercel with CI/CD",
      category: "tech",
      description: "I will set up your production deployment environment, configure custom domains, SSL, environment variables, and automated GitHub Actions CI/CD pipelines.",
      price: 8000,
      deliveryDays: 3,
      revisions: 2,
      tags: ["aws", "vercel", "deployment"],
      icon: "code-2",
      coverTheme: "theme-tech",
      ratingAverage: 4.9,
      ratingCount: 8,
      status: "active",
      seller: ashish._id
    },
    {
      title: "I will design and optimize your MongoDB Database Schema",
      category: "tech",
      description: "Get a highly optimized database structure with indexing strategy, validation rules, aggregation pipelines, and performance tuning suggestions.",
      price: 6000,
      deliveryDays: 2,
      revisions: 1,
      tags: ["mongodb", "database", "design"],
      icon: "code-2",
      coverTheme: "theme-tech",
      ratingAverage: 4.8,
      ratingCount: 12,
      status: "active",
      seller: ashish._id
    }
  ];

  const seededAshishServices = [];
  for (const service of ashishServices) {
    const s = await Service.create(service);
    seededAshishServices.push(s);
    serviceDocs.push(s);
  }

  // 2. Seed Tony Stark (Client)
  const tony = await User.create({
    name: "Tony Stark",
    email: "tony@freelancehub.local",
    passwordHash,
    roles: ["client", "freelancer"],
    activeRole: "client",
    profile: {
      headline: "Industrialist & Tech Investor",
      bio: "Looking for top-tier developers to build robust, modern software prototypes.",
      country: "United States",
      avatarColor: "#e05355"
    },
    onboarding: {
      roleChoiceComplete: true,
      freelancerComplete: true,
      clientComplete: true,
    }
  });

  const dateOffsetMonths = (monthsAgo, day = 15) => {
    const d = new Date();
    d.setMonth(d.getMonth() - monthsAgo);
    d.setDate(day);
    d.setHours(12, 0, 0, 0);
    return d;
  };

  // Month 5 (Feb):
  // Tony Topup 50k
  await WalletTransaction.create({
    user: tony._id,
    amount: 50000,
    direction: "credit",
    status: "succeeded",
    type: "top_up",
    paymentProvider: "demo",
    description: "Demo wallet top-up",
    createdAt: dateOffsetMonths(5, 5),
    completedAt: dateOffsetMonths(5, 5),
  });
  // Tony buys REST API (12000) from Ashish
  const order1 = await Order.create({
    client: tony._id,
    freelancer: ashish._id,
    service: seededAshishServices[0]._id,
    title: `${seededAshishServices[0].title} - Project`,
    requirements: "Need custom authentication and secure database operations.",
    amount: 12000,
    freelancerAmount: 10560,
    platformFee: 1440,
    paymentStatus: "paid",
    status: "completed",
    dueAt: dateOffsetMonths(5, 15),
    createdAt: dateOffsetMonths(5, 10),
    completedAt: dateOffsetMonths(5, 15),
  });
  await WalletTransaction.create({
    user: tony._id,
    amount: 12000,
    direction: "debit",
    status: "succeeded",
    type: "purchase",
    paymentProvider: "demo",
    description: `Demo payment for: ${order1.title}`,
    createdAt: dateOffsetMonths(5, 10),
    completedAt: dateOffsetMonths(5, 10),
  });
  await WalletTransaction.create({
    user: ashish._id,
    amount: 10560,
    direction: "credit",
    status: "succeeded",
    type: "adjustment",
    paymentProvider: "demo",
    description: `Payout for order ${order1._id}`,
    createdAt: dateOffsetMonths(5, 15),
    completedAt: dateOffsetMonths(5, 15),
  });

  // Month 4 (Mar):
  // Tony buys AWS Deployment (8000) from Ashish
  const order2 = await Order.create({
    client: tony._id,
    freelancer: ashish._id,
    service: seededAshishServices[1]._id,
    title: `${seededAshishServices[1].title} - Project`,
    requirements: "Configure Vercel and AWS domain linking.",
    amount: 8000,
    freelancerAmount: 7040,
    platformFee: 960,
    paymentStatus: "paid",
    status: "completed",
    dueAt: dateOffsetMonths(4, 18),
    createdAt: dateOffsetMonths(4, 14),
    completedAt: dateOffsetMonths(4, 18),
  });
  await WalletTransaction.create({
    user: tony._id,
    amount: 8000,
    direction: "debit",
    status: "succeeded",
    type: "purchase",
    paymentProvider: "demo",
    description: `Demo payment for: ${order2.title}`,
    createdAt: dateOffsetMonths(4, 14),
    completedAt: dateOffsetMonths(4, 14),
  });
  await WalletTransaction.create({
    user: ashish._id,
    amount: 7040,
    direction: "credit",
    status: "succeeded",
    type: "adjustment",
    paymentProvider: "demo",
    description: `Payout for order ${order2._id}`,
    createdAt: dateOffsetMonths(4, 18),
    completedAt: dateOffsetMonths(4, 18),
  });
  // Ashish does a withdrawal of 10000
  await WalletTransaction.create({
    user: ashish._id,
    amount: 10000,
    direction: "debit",
    status: "succeeded",
    type: "adjustment",
    paymentProvider: "demo",
    description: "Demo payout withdrawal to bank account",
    createdAt: dateOffsetMonths(4, 20),
    completedAt: dateOffsetMonths(4, 20),
  });

  // Month 3 (Apr):
  // Tony Topup 30k
  await WalletTransaction.create({
    user: tony._id,
    amount: 30000,
    direction: "credit",
    status: "succeeded",
    type: "top_up",
    paymentProvider: "demo",
    description: "Demo wallet top-up",
    createdAt: dateOffsetMonths(3, 2),
    completedAt: dateOffsetMonths(3, 2),
  });
  // Another client buys AWS deployment (8000) from Ashish
  const otherClient = clientDocs[0];
  const order3 = await Order.create({
    client: otherClient._id,
    freelancer: ashish._id,
    service: seededAshishServices[1]._id,
    title: `${seededAshishServices[1].title} - Project`,
    requirements: "Deploy dashboard staging environment.",
    amount: 8000,
    freelancerAmount: 7040,
    platformFee: 960,
    paymentStatus: "paid",
    status: "completed",
    dueAt: dateOffsetMonths(3, 20),
    createdAt: dateOffsetMonths(3, 15),
    completedAt: dateOffsetMonths(3, 20),
  });
  await WalletTransaction.create({
    user: otherClient._id,
    amount: 8000,
    direction: "debit",
    status: "succeeded",
    type: "purchase",
    paymentProvider: "demo",
    description: `Demo payment for: ${order3.title}`,
    createdAt: dateOffsetMonths(3, 15),
    completedAt: dateOffsetMonths(3, 15),
  });
  await WalletTransaction.create({
    user: ashish._id,
    amount: 7040,
    direction: "credit",
    status: "succeeded",
    type: "adjustment",
    paymentProvider: "demo",
    description: `Payout for order ${order3._id}`,
    createdAt: dateOffsetMonths(3, 20),
    completedAt: dateOffsetMonths(3, 20),
  });

  // Month 2 (May):
  // Tony buys MongoDB Schema (6000) from Ashish
  const order4 = await Order.create({
    client: tony._id,
    freelancer: ashish._id,
    service: seededAshishServices[2]._id,
    title: `${seededAshishServices[2].title} - Project`,
    requirements: "Define indices and validation logic.",
    amount: 6000,
    freelancerAmount: 5280,
    platformFee: 720,
    paymentStatus: "paid",
    status: "completed",
    dueAt: dateOffsetMonths(2, 10),
    createdAt: dateOffsetMonths(2, 8),
    completedAt: dateOffsetMonths(2, 10),
  });
  await WalletTransaction.create({
    user: tony._id,
    amount: 6000,
    direction: "debit",
    status: "succeeded",
    type: "purchase",
    paymentProvider: "demo",
    description: `Demo payment for: ${order4.title}`,
    createdAt: dateOffsetMonths(2, 8),
    completedAt: dateOffsetMonths(2, 8),
  });
  await WalletTransaction.create({
    user: ashish._id,
    amount: 5280,
    direction: "credit",
    status: "succeeded",
    type: "adjustment",
    paymentProvider: "demo",
    description: `Payout for order ${order4._id}`,
    createdAt: dateOffsetMonths(2, 10),
    completedAt: dateOffsetMonths(2, 10),
  });
  // Ashish does withdrawal of 8000
  await WalletTransaction.create({
    user: ashish._id,
    amount: 8000,
    direction: "debit",
    status: "succeeded",
    type: "adjustment",
    paymentProvider: "demo",
    description: "Demo payout withdrawal to bank account",
    createdAt: dateOffsetMonths(2, 15),
    completedAt: dateOffsetMonths(2, 15),
  });

  // Month 1 (Jun):
  // Tony Topup 20k
  await WalletTransaction.create({
    user: tony._id,
    amount: 20000,
    direction: "credit",
    status: "succeeded",
    type: "top_up",
    paymentProvider: "demo",
    description: "Demo wallet top-up",
    createdAt: dateOffsetMonths(1, 5),
    completedAt: dateOffsetMonths(1, 5),
  });
  // Another client buys MongoDB Schema (6000) from Ashish
  const order5 = await Order.create({
    client: clientDocs[1]._id,
    freelancer: ashish._id,
    service: seededAshishServices[2]._id,
    title: `${seededAshishServices[2].title} - Project`,
    requirements: "Optimize indexes for high volume queries.",
    amount: 6000,
    freelancerAmount: 5280,
    platformFee: 720,
    paymentStatus: "paid",
    status: "completed",
    dueAt: dateOffsetMonths(1, 22),
    createdAt: dateOffsetMonths(1, 20),
    completedAt: dateOffsetMonths(1, 22),
  });
  await WalletTransaction.create({
    user: clientDocs[1]._id,
    amount: 6000,
    direction: "debit",
    status: "succeeded",
    type: "purchase",
    paymentProvider: "demo",
    description: `Demo payment for: ${order5.title}`,
    createdAt: dateOffsetMonths(1, 20),
    completedAt: dateOffsetMonths(1, 20),
  });
  await WalletTransaction.create({
    user: ashish._id,
    amount: 5280,
    direction: "credit",
    status: "succeeded",
    type: "adjustment",
    paymentProvider: "demo",
    description: `Payout for order ${order5._id}`,
    createdAt: dateOffsetMonths(1, 22),
    completedAt: dateOffsetMonths(1, 22),
  });

  // Current Month (Jul):
  // Tony buys REST API (12000) from Ashish - Active in_progress order
  const order6 = await Order.create({
    client: tony._id,
    freelancer: ashish._id,
    service: seededAshishServices[0]._id,
    title: `${seededAshishServices[0].title} - Project`,
    requirements: "Phase 2 extension - add analytics endpoints and websocket support.",
    amount: 12000,
    freelancerAmount: 10560,
    platformFee: 1440,
    paymentStatus: "paid",
    status: "in_progress",
    dueAt: dateOffsetMonths(0, 28),
    createdAt: dateOffsetMonths(0, 10),
  });
  await WalletTransaction.create({
    user: tony._id,
    amount: 12000,
    direction: "debit",
    status: "succeeded",
    type: "purchase",
    paymentProvider: "demo",
    description: `Demo payment for: ${order6.title}`,
    createdAt: dateOffsetMonths(0, 10),
    completedAt: dateOffsetMonths(0, 10),
  });

  // Tony buys AWS Deployment (8000) from Ashish - Submitted order awaiting review
  const order7 = await Order.create({
    client: tony._id,
    freelancer: ashish._id,
    service: seededAshishServices[1]._id,
    title: `${seededAshishServices[1].title} - Project`,
    requirements: "Deploy client app and setup SSL redirection.",
    amount: 8000,
    freelancerAmount: 7040,
    platformFee: 960,
    paymentStatus: "paid",
    status: "submitted",
    dueAt: dateOffsetMonths(0, 20),
    createdAt: dateOffsetMonths(0, 14),
  });
  await WalletTransaction.create({
    user: tony._id,
    amount: 8000,
    direction: "debit",
    status: "succeeded",
    type: "purchase",
    paymentProvider: "demo",
    description: `Demo payment for: ${order7.title}`,
    createdAt: dateOffsetMonths(0, 14),
    completedAt: dateOffsetMonths(0, 14),
  });

  // Ashish does a withdrawal of 5000 in current month
  await WalletTransaction.create({
    user: ashish._id,
    amount: 5000,
    direction: "debit",
    status: "succeeded",
    type: "adjustment",
    paymentProvider: "demo",
    description: "Demo payout withdrawal to bank account",
    createdAt: dateOffsetMonths(0, 12),
    completedAt: dateOffsetMonths(0, 12),
  });

  // Messages between Tony and Ashish
  await Message.create({
    order: order6._id,
    sender: tony._id,
    recipient: ashish._id,
    body: "Hi Ashish, I've funded the milestone for the websocket integration. Let me know when you can start.",
    createdAt: dateOffsetMonths(0, 10),
  });

  await Message.create({
    order: order6._id,
    sender: ashish._id,
    recipient: tony._id,
    body: "Thanks Tony! I am starting on it today. Will update you as soon as the websocket baselines are up.",
    createdAt: dateOffsetMonths(0, 11),
  });

  await Message.create({
    order: order7._id,
    sender: ashish._id,
    recipient: tony._id,
    body: "I've deployed the app to AWS and configured SSL. Please review it at your convenience.",
    createdAt: dateOffsetMonths(0, 14),
  });

  console.log(`Seed complete. Added Tony Stark, Ashish Shankar, 18 sellers, 4 clients, and demo orders. Password for all: ${seedPassword}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
