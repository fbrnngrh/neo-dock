export interface Profile {
  name: string
  role: string
  taglines: string[]
  socials: Array<{
    label: string
    url: string
  }>
}

export const profile: Profile = {
  name: "Neo Developer",
  role: "Full-stack Web Developer",
  taglines: ["Building the future with brutal honesty", "Code that hits different", "No compromises, just results"],
  socials: [
    { label: "GitHub", url: "https://github.com" },
    { label: "LinkedIn", url: "https://linkedin.com" },
    { label: "Twitter", url: "https://twitter.com" },
    { label: "Email", url: "mailto:hello@example.com" },
  ],
}
