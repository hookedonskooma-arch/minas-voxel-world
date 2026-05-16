'use client';

import { useAvatarStore } from '@/store/avatarStore';
import AvatarPreview from '@/components/avatar/AvatarPreview';
import OptionPicker from '@/components/avatar/OptionPicker';
import { Sparkles, RotateCcw, Save, Share2 } from 'lucide-react';

export default function AvatarStudioPage() {
  const { appearance, resetToDefault } = useAvatarStore();

  const handleSave = async () => {
    // TODO: Save to Supabase
    console.log('Saving avatar:', appearance);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#F0FDFA] to-[#FFE4E1]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b-2 border-[#E5E7EB] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00B398] to-[#004F71] rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#004F71]">Mina's World</h1>
              <p className="text-xs text-[#00B398] font-medium">Avatar Studio</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefault}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#004F71] bg-white border-2 border-[#E5E7EB] rounded-xl hover:border-[#00B398] hover:text-[#00B398] transition-all"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#00B398] to-[#004F71] rounded-xl hover:shadow-lg hover:scale-105 transition-all"
            >
              <Save size={16} />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#004F71]">Create Your Chibi Avatar</h2>
          <p className="text-[#004F71]/60 mt-1">Design your character — pick hair, eyes, clothes, and more!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Panel */}
          <div className="order-1 lg:order-2">
            <AvatarPreview />
            
            {/* Quick Stats */}
            <div className="mt-4 bg-white rounded-xl border-2 border-[#E5E7EB] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#004F71]/60">Accessories</span>
                <span className="font-medium text-[#004F71]">{appearance.accessories.length} / 5</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {appearance.accessories.map((acc) => (
                  <span
                    key={acc}
                    className="px-2 py-1 bg-[#F0FDFA] text-[#00B398] text-xs rounded-lg font-medium"
                  >
                    {acc.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Options Panel */}
          <div className="order-2 lg:order-1">
            <OptionPicker />
          </div>
        </div>
      </main>
    </div>
  );
}
