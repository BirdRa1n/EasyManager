export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "EasyManger",
  description: "Gerencie organizações, lojas, estoques, produtos e fornecedores com segurança e escalabilidade.",
  navItems: [
    {
      label: "Início",
      href: "/",
    },
    {
      label: "Preços",
      href: "/pricing",
    },
    {
      label: "Sobre",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Organização",
      href: "/team",
    },
    {
      label: "Configurações",
      href: "/settings",
    },
    {
      label: "Ajuda & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Sair",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/birdra1n",
    twitter: "https://twitter.com/birdra1n",
    docs: "https://birdra1n.github.io",
    discord: "https://discord.gg/birdra1n",
    sponsor: "https://patreon.com/birdra1n",
  },
};
