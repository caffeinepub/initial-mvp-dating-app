import { useState } from 'react';
import { useSendMessage } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';

interface MessageComposerProps {
  matchPrincipal: Principal;
}

export default function MessageComposer({ matchPrincipal }: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const { mutate: sendMessage, isPending } = useSendMessage();

  const handleSend = () => {
    if (!message.trim() || isPending) return;

    sendMessage(
      { to: matchPrincipal, content: message.trim() },
      {
        onSuccess: () => {
          setMessage('');
        },
        onError: () => {
          toast.error('Failed to send message. Please try again.');
        }
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-4 bg-background">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[60px] max-h-[120px] resize-none"
          disabled={isPending}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isPending}
          size="icon"
          className="h-[60px] w-[60px] rounded-full"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
