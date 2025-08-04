export interface Template {
  id: string;
  name: string;
  description: string;
  repo: string;
  preview: string;
  logo: string;
}

const templatesData = {
  nextjs: {
    id: "nextjs-dkjfgdf",
    name: "Next.js + Shadcn",
    description: "A modern Next.js app with Shadcn UI components",
    repo: "https://github.com/vercel/next.js/tree/canary/examples/with-typescript",
    preview: "https://nextjs.org",
    logo: "/logos/next.svg",
  },
  react: {
    id: "vite-react-typescript-swc",
    name: "Vite + React + TypeScript",
    description: "Fast React development with Vite and TypeScript",
    repo: "https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts",
    preview: "https://vitejs.dev",
    logo: "/logos/vite.svg",
  },
  expo: {
    id: "expo",
    name: "Expo React Native",
    description: "Cross-platform mobile development with Expo",
    repo: "https://github.com/expo/expo/tree/main/templates/expo-template-blank-typescript",
    preview: "https://expo.dev",
    logo: "/logos/expo.svg",
  },
} as const satisfies Record<string, Template>;

// Export as array for find() method compatibility
export const templates = Object.values(templatesData);

// Export the object for direct access by key if needed elsewhere
export const templatesMap = templatesData;

// Helper function to get template ID from framework key
export function getTemplateId(frameworkKey: keyof typeof templatesData): string {
  return templatesData[frameworkKey].id;
}
