"use client"

import { profile } from "@/data/profile"

export function ContactView() {
  const handleEmailClick = () => {
    window.location.href = "mailto:hello@example.com?subject=Let's work together!"
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-neo-bg border-4 border-neo-border shadow-neo rounded-none p-6">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-neo-fg">Contact</h1>
        <p className="text-lg font-medium text-neo-fg">Ready to build something brutal together?</p>
      </div>

      {/* Contact Form */}
      <div className="bg-neo-bg2 border-4 border-neo-border shadow-neo rounded-none p-6">
        <h2 className="text-2xl font-bold mb-4 text-neo-fg">Get In Touch</h2>
        <p className="text-base leading-6 mb-6 text-neo-fg">
          I'm always interested in new opportunities, collaborations, and challenging projects. Whether you have a
          specific project in mind or just want to connect, I'd love to hear from you.
        </p>

        <button
          onClick={handleEmailClick}
          className="w-full bg-neo-fg text-neo-bg border-4 border-neo-border shadow-neo rounded-none hover:shadow-[4px_4px_0_0_var(--neo-shadow)] hover:translate-x-[-4px] hover:translate-y-[-4px] p-4 text-lg font-bold transition-all duration-200 neo-focus mb-6"
        >
          Send Me An Email
        </button>

        <div className="text-center text-sm text-neo-fg-muted">
          <p>Or reach out through any of the social platforms below</p>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-neo-bg border-4 border-neo-border shadow-neo rounded-none p-6">
        <h3 className="text-xl font-bold mb-4 text-neo-fg">Find Me Online</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profile.socials.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neo-bg3 text-neo-fg border-4 border-neo-border shadow-neo rounded-none hover:shadow-[4px_4px_0_0_var(--neo-shadow)] hover:translate-x-[-4px] hover:translate-y-[-4px] p-4 text-center font-bold transition-all duration-200 neo-focus underline decoration-4 underline-offset-4"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="bg-neo-bg3 border-4 border-neo-border shadow-neo rounded-none p-6">
        <h3 className="text-xl font-bold mb-2 text-neo-fg">Current Status</h3>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-neo-fg border-2 border-neo-border rounded-none"></div>
          <span className="font-bold text-neo-fg">Available for new projects</span>
        </div>
        <p className="text-sm mt-2 text-neo-fg">
          I'm currently accepting new freelance projects and full-time opportunities. Let's discuss how we can work
          together!
        </p>
      </div>
    </div>
  )
}
