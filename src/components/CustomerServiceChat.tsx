import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
export function CustomerServiceChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Halo! 👋 Saya asisten customer service 44Trans. Ada yang bisa saya bantu hari ini?\n\nAnda bisa bertanya tentang:\n• Jadwal & harga travel\n• Promo yang sedang berlaku\n• Cara booking\n• Pertanyaan umum lainnya',
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      // Prepare conversation history (exclude the welcome message)
      const conversationHistory = messages.slice(1).map(m => ({
        role: m.role,
        content: m.content
      }));
      const {
        data,
        error
      } = await supabase.functions.invoke('customer-service-chat', {
        body: {
          message: userMessage.content,
          conversationHistory
        }
      });
      if (error) throw error;
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message || 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Gagal mengirim pesan. Silakan coba lagi.');
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi atau hubungi customer service kami via WhatsApp.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  return <>
      {/* Chat Button */}
      

      {/* Chat Window */}
      {isOpen && <div className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] flex flex-col bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Customer Service</h3>
                <p className="text-xs opacity-90">44Trans • Online</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary-foreground/20">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => <div key={index} className={cn("flex gap-2", message.role === 'user' ? "justify-end" : "justify-start")}>
                  {message.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>}
                  <div className={cn("max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap", message.role === 'user' ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md")}>
                    {message.content}
                  </div>
                  {message.role === 'user' && <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>}
                </div>)}
              {isLoading && <div className="flex gap-2 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{
                  animationDelay: '0ms'
                }} />
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{
                  animationDelay: '150ms'
                }} />
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{
                  animationDelay: '300ms'
                }} />
                    </div>
                  </div>
                </div>}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border bg-background">
            <div className="flex gap-2">
              <Input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyPress} placeholder="Ketik pesan Anda..." disabled={isLoading} className="flex-1" />
              <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon" className="shrink-0">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>}
    </>;
}