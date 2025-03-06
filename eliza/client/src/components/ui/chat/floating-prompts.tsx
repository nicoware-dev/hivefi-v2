import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExamplePrompt, ExamplePrompts } from './example-prompts';
import { Lightbulb, X } from 'lucide-react';

interface FloatingPromptsProps {
  prompts: ExamplePrompt[];
  onPromptClick: (prompt: string) => void;
}

export function FloatingPrompts({ prompts, onPromptClick }: FloatingPromptsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-24 right-4 z-20 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 bg-[#121212] border border-[#27272A] rounded-lg p-4 shadow-lg w-80 md:w-96 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#7f00ff]">Example Prompts</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleOpen}
              className="h-6 w-6 text-muted-foreground hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {prompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                className="flex items-center justify-start gap-2 p-3 h-auto text-left border-[#27272A] bg-[#121212] hover:bg-[#7f00ff]/10 hover:border-[#7f00ff]/50 text-white transition-all duration-200"
                onClick={() => {
                  onPromptClick(prompt.text);
                  setIsOpen(false);
                }}
              >
                {prompt.icon && (
                  <span className="flex-shrink-0 text-[#7f00ff]">{prompt.icon}</span>
                )}
                <span className="truncate">{prompt.text}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="relative">
        <div className="absolute inset-0 bg-[#7f00ff]/30 rounded-full animate-pulse"></div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleOpen}
          className="relative h-12 w-12 rounded-full bg-[#7f00ff] border-none text-white hover:bg-[#7f00ff]/90 shadow-md"
          title="Show example prompts"
        >
          <Lightbulb className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
} 