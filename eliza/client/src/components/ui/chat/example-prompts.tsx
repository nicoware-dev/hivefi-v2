import React from 'react';
import { Button } from '@/components/ui/button';

export interface ExamplePrompt {
  text: string;
  icon?: React.ReactNode;
}

interface ExamplePromptsProps {
  prompts: ExamplePrompt[];
  onPromptClick: (prompt: string) => void;
}

export function ExamplePrompts({ prompts, onPromptClick }: ExamplePromptsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
      {prompts.map((prompt, index) => (
        <Button
          key={index}
          variant="outline"
          className="flex items-center justify-start gap-2 p-4 h-auto text-left border-[#27272A] bg-[#121212] hover:bg-[#7f00ff]/10 hover:border-[#7f00ff]/50 text-white transition-all duration-200 shadow-sm hover:shadow-md"
          onClick={() => onPromptClick(prompt.text)}
        >
          {prompt.icon && (
            <span className="flex-shrink-0 text-[#7f00ff]">{prompt.icon}</span>
          )}
          <span className="truncate">{prompt.text}</span>
        </Button>
      ))}
    </div>
  );
} 