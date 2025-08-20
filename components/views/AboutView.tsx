"use client"

import { profile } from "@/data/profile"

export function AboutView() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Hero Section */}
      <div className="bg-neo-bg border-2 border-neo-border shadow-neo rounded-xl p-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-neo-fg">{profile.name}</h1>
        <h2 className="text-xl font-semibold text-neo-fg2 mb-6">{profile.role}</h2>
        <div className="space-y-3">
          {profile.taglines.map((tagline, index) => (
            <p key={index} className="text-lg font-medium text-neo-fg leading-relaxed">
              {tagline}
            </p>
          ))}
        </div>
      </div>

      {/* About Content */}
      <div className="bg-neo-bg2 border-2 border-neo-border shadow-neo rounded-xl p-8">
        <h3 className="text-2xl font-bold mb-6 text-neo-fg">About Me</h3>
        <div className="space-y-5 text-base leading-7 text-neo-fg">
          <p>
            I'm a passionate full-stack developer who believes in building software with brutal honesty and no
            compromises. My approach combines cutting-edge technology with bold, uncompromising design principles.
          </p>
          <p>
            With expertise spanning frontend frameworks, backend systems, and modern development tools, I create digital
            experiences that are both functionally robust and visually striking.
          </p>
          <p>
            When I'm not coding, you'll find me exploring new technologies, contributing to open source projects, or
            pushing the boundaries of what's possible in web development.
          </p>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-neo-bg3 border-2 border-neo-border shadow-neo rounded-xl p-8">
        <h3 className="text-2xl font-bold mb-6 text-neo-fg">Connect With Me</h3>
        <div className="grid grid-cols-2 gap-4">
          {profile.socials.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neo-bg border-2 border-neo-border shadow-neo rounded-lg hover:shadow-[2px_2px_0_0_var(--neo-shadow)] hover:translate-x-[-2px] hover:translate-y-[-2px] p-4 text-center font-semibold transition-all duration-200 neo-focus text-neo-fg hover:bg-neo-bg2"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
