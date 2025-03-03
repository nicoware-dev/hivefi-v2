import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatFileInputProps {
    onFileSelect: (file: File | null) => void;
    selectedFile: File | null;
}

export function ChatFileInput({ onFileSelect, selectedFile }: ChatFileInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                console.log("Selected file:", {
                    name: file.name,
                    type: file.type,
                    size: file.size
                });
                onFileSelect(file);
            } else {
                console.warn("Invalid file type:", file.type);
                alert("Please select an image file");
            }
        }
    };

    return (
        <>
            {selectedFile ? (
                <div className="p-3 flex">
                    <div className="relative rounded-md border p-2">
                        <Button
                            onClick={() => onFileSelect(null)}
                            className="absolute -right-2 -top-2 size-[22px] ring-2 ring-background"
                            variant="outline"
                            size="icon"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                        <img
                            alt="Selected file"
                            src={URL.createObjectURL(selectedFile)}
                            height="100%"
                            width="100%"
                            className="aspect-square object-contain w-16"
                        />
                    </div>
                </div>
            ) : (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip className="h-4 w-4" />
                                <span className="sr-only">Attach file</span>
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Attach image</p>
                    </TooltipContent>
                </Tooltip>
            )}
        </>
    );
}
