"use client"

import { profile } from "@/data/profile"

export function AboutView() {
  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl md:max-w-4xl lg:max-w-6xl w-full">
      {/* Hero Section */}
      <div className="bg-neo-bg border-2 border-neo-border shadow-neo rounded-xl p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2 md:mb-3 text-neo-fg">
          {profile.name}
        </h1>
        <h2 className="text-lg md:text-xl font-semibold text-neo-fg2 mb-4 md:mb-6">{profile.role}</h2>
        <div className="space-y-2 md:space-y-3">
          {profile.taglines.map((tagline, index) => (
            <p key={index} className="text-base md:text-lg font-medium text-neo-fg leading-relaxed">
              {tagline}
            </p>
          ))}
        </div>
      </div>

      {/* About Content */}
      <div className="bg-neo-bg2 border-2 border-neo-border shadow-neo rounded-xl p-4 md:p-6 lg:p-8">
        <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-neo-fg">About Me</h3>
        <div className="space-y-4 md:space-y-5 text-sm md:text-base leading-6 md:leading-7 text-neo-fg">
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
      <div className="bg-neo-bg3 border-2 border-neo-border shadow-neo rounded-xl p-4 md:p-6 lg:p-8">
        <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-neo-fg">Connect With Me</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {profile.socials.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neo-bg border-2 border-neo-border shadow-neo rounded-lg hover:shadow-[2px_2px_0_0_var(--neo-shadow)] hover:translate-x-[-2px] hover:translate-y-[-2px] p-3 md:p-4 text-center text-sm md:text-base font-semibold transition-all duration-200 neo-focus text-neo-fg hover:bg-neo-bg2"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
