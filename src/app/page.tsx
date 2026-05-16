import Link from 'next/link';
import { Sparkles, Globe, Users, Shield, Wrench, Heart, Star, ChevronRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE4F3] via-[#F0F4FF] to-[#E0F7FF] p-6 md:p-10">
      <div className="max-w-md mx-auto">
        {/* Header Badge */}
        <div className="mb-6">
          <p className="text-xs font-bold tracking-widest text-[#6B7280] uppercase mb-2">
            Refreshable Product Prototype
          </p>
          <h1 className="text-5xl font-black text-[#1F2937] tracking-tight leading-none mb-3">
            Mina&apos;s World
          </h1>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            A safe kawaii sandbox where kids design chibi avatars, build tiny worlds, and visit friends.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3 mb-8">
          <Link
            href="/studio"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#00B398] to-[#004F71] rounded-2xl shadow-lg shadow-[#00B398]/25 hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Sparkles size={16} />
            Open landing page
          </Link>
          <Link
            href="/worlds"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-[#374151] bg-white/80 backdrop-blur-sm border border-[#E5E7EB] rounded-2xl hover:bg-white hover:border-[#00B398]/30 transition-all"
          >
            <Globe size={16} />
            View iOS widgets
          </Link>
        </div>

        {/* Live Snapshot Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 shadow-lg shadow-black/5 border border-white/50 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[#9CA3AF] uppercase">
                Live Snapshot
              </p>
              <h2 className="text-lg font-bold text-[#1F2937]">Design a cloud garden</h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFE4F3] to-[#E0F7FF] flex items-center justify-center">
              <Star size={20} className="text-[#F2A900]" />
            </div>
          </div>

          <div className="space-y-3">
            <SnapshotRow label="Friends" value="3 approved friends online" icon={<Users size={14} />} />
            <SnapshotRow label="Safety" value="All sharing set to friends-only" icon={<Shield size={14} />} />
            <SnapshotRow label="Build" value="Cloud Plaza is 68% decorated" icon={<Wrench size={14} />} />
          </div>
        </div>

        {/* iOS Screen Cards - Horizontal Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <ScreenCard
            tag="iOS screen"
            title="Onboarding"
            description="Choose a starter style, create a kid-safe profile, and enter Mina's first world."
            gradient="from-[#FFE4F3]/60 to-[#E0F7FF]/60"
            href="/studio"
          />
          <ScreenCard
            tag="iOS screen"
            title="Avatar Creator"
            description="Customize chibi hair, eyes, outfit, and accessories with parent-safe presets."
            gradient="from-[#E0F7FF]/60 to-[#F0F4FF]/60"
            href="/studio"
          />
          <ScreenCard
            tag="iOS screen"
            title="World Builder"
            description="Place houses, parks, shops, and decorations in a friendly drag-and-drop builder."
            gradient="from-[#F0F4FF]/60 to-[#FFE4F3]/60"
            href="/worlds"
          />
          <ScreenCard
            tag="iOS screen"
            title="Friend Visit"
            description="Visit approved friends, use canned chat, and explore together with guardian limits."
            gradient="from-[#FFE4F3]/60 to-[#E0F7FF]/60"
            href="/worlds"
          />
          <ScreenCard
            tag="iOS screen"
            title="Quest Map"
            description="Follow daily creative quests and learning mini-games without pressure loops."
            gradient="from-[#E0F7FF]/60 to-[#F0F4FF]/60"
            href="/worlds"
          />
        </div>

        {/* Widget Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <WidgetCard
            tag="Quest Widget"
            title="Cloud Garden"
            description="2 steps left"
          />
          <WidgetCard
            tag="Parent Glance"
            title="Safe mode on"
            description="Friend visits require approval"
          />
          <WidgetCard
            tag="Lock Invite"
            title="Lulu is visiting"
            description="Approve 20 min playdate"
          />
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center">
          <p className="text-xs text-[#9CA3AF]">
            Sample preview data - refreshable later
          </p>
          <p className="text-xs text-[#9CA3AF] mt-2">
            Made with <Heart size={12} className="inline text-[#EF4444]" /> by Mina & Dad
          </p>
        </footer>
      </div>
    </div>
  );
}

function SnapshotRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <span className="text-[#9CA3AF]">{icon}</span>
        {label}
      </div>
      <span className="text-sm font-semibold text-[#1F2937]">{value}</span>
    </div>
  );
}

function ScreenCard({ tag, title, description, gradient, href }: { tag: string; title: string; description: string; gradient: string; href: string }) {
  return (
    <Link href={href} className="group block bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden shadow-md shadow-black/5 border border-white/50 hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer">
      <div className={`bg-gradient-to-br ${gradient} p-4`}>
        <span className="inline-block px-2 py-1 text-[10px] font-bold tracking-wider text-[#00B398] bg-white/80 rounded-lg mb-3">
          {tag}
        </span>
        <h3 className="text-lg font-bold text-[#1F2937] mb-1">{title}</h3>
        <p className="text-xs text-[#6B7280]">Open screen file</p>
      </div>
      <div className="p-4 bg-white/40">
        <h4 className="text-sm font-bold text-[#1F2937] mb-1">{title}</h4>
        <p className="text-xs text-[#6B7280] leading-relaxed">{description}</p>
        <div className="mt-3 flex items-center text-[#00B398] text-xs font-semibold">
          Explore <ChevronRight size={14} className="ml-1" />
        </div>
      </div>
    </Link>
  );
}

function WidgetCard({ tag, title, description }: { tag: string; title: string; description: string }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 shadow-md shadow-black/5 border border-white/50">
      <span className="inline-block px-2 py-1 text-[9px] font-bold tracking-wider text-[#00B398] bg-[#00B398]/10 rounded-md mb-2">
        {tag}
      </span>
      <h4 className="text-sm font-bold text-[#1F2937] mb-1">{title}</h4>
      <p className="text-xs text-[#6B7280]">{description}</p>
    </div>
  );
}
