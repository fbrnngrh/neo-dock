"use client"

import { profile } from "@/data/profile"

export function ContactView() {
  const handleEmailClick = () => {
    window.location.href = "mailto:hello@example.com?subject=Let's work together!"
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl md:max-w-4xl lg:max-w-6xl w-full">
      {/* Header */}
      <div className="bg-neo-bg border-4 border-neo-border shadow-neo rounded-none p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-neo-fg">Contact</h1>
        <p className="text-base md:text-lg font-medium text-neo-fg">Ready to build something brutal together?</p>
      </div>

      {/* Contact Form */}
      <div className="bg-neo-bg2 border-4 border-neo-border shadow-neo rounded-none p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-neo-fg">Get In Touch</h2>
        <p className="text-sm md:text-base leading-5 md:leading-6 mb-4 md:mb-6 text-neo-fg">
          I'm always interested in new opportunities, collaborations, and challenging projects. Whether you have a
          specific project in mind or just want to connect, I'd love to hear from you.
        </p>

        <button
          onClick={handleEmailClick}
          className="w-full md:w-auto md:min-w-[300px] bg-neo-fg text-neo-bg border-4 border-neo-border shadow-neo rounded-none hover:shadow-[4px_4px_0_0_var(--neo-shadow)] hover:translate-x-[-4px] hover:translate-y-[-4px] p-3 md:p-4 text-base md:text-lg font-bold transition-all duration-200 neo-focus mb-4 md:mb-6"
        >
          Send Me An Email
        </button>

        <div className="text-center text-xs md:text-sm text-neo-fg-muted">
          <p>Or reach out through any of the social platforms below</p>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-neo-bg border-4 border-neo-border shadow-neo rounded-none p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold mb-4 text-neo-fg">Find Me Online</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {profile.socials.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neo-bg3 text-neo-fg border-4 border-neo-border shadow-neo rounded-none hover:shadow-[4px_4px_0_0_var(--neo-shadow)] hover:translate-x-[-4px] hover:translate-y-[-4px] p-3 md:p-4 text-center text-sm md:text-base font-bold transition-all duration-200 neo-focus underline decoration-4 underline-offset-4"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="bg-neo-bg3 border-4 border-neo-border shadow-neo rounded-none p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold mb-2 text-neo-fg">Current Status</h3>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-neo-fg border-2 border-neo-border rounded-none"></div>
          <span className="text-sm md:text-base font-bold text-neo-fg">Available for new projects</span>
        </div>
        <p className="text-xs md:text-sm mt-2 text-neo-fg">
          I'm currently accepting new freelance projects and full-time opportunities. Let's discuss how we can work
          together!
        </p>
      </div>
    </div>
  )
}
