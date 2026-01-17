import { useState, useRef, useEffect } from "react";
import { ChatMessage, Message } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { CampusSelector } from "@/components/CampusSelector";
import { SuggestionChips } from "@/components/SuggestionChips";
import { generateResponse } from "@/lib/chatResponses";
import { GraduationCap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedCampus, setSelectedCampus] = useState("all");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 800));

    const response = generateResponse(content, selectedCampus);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, assistantMessage]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Rutgers Course Assistant</h1>
              <p className="text-xs text-muted-foreground">Your guide to course planning</p>
            </div>
          </div>
          <CampusSelector value={selectedCampus} onChange={setSelectedCampus} />
        </div>
      </header>

      {/* Chat Area */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Welcome to Course Chat
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Ask me anything about Rutgers courses, prerequisites, schedules, and more. I'm here to help you plan your academic journey.
              </p>
              <SuggestionChips onSelect={handleSendMessage} />
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="bg-chat-assistant border border-border rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border bg-card px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {messages.length > 0 && messages.length < 3 && (
            <div className="mb-3">
              <SuggestionChips onSelect={handleSendMessage} />
            </div>
          )}
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
          <p className="text-xs text-muted-foreground text-center mt-3">
            Demo version with sample course data. Ask about CS, MATH courses, and more.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
