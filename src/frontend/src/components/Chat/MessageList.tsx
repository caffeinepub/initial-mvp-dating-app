import { useEffect, useRef } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { cn } from '@/lib/utils';
import type { Message } from '@/backend';
import type { Principal } from '@icp-sdk/core/principal';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageListProps {
  messages: Message[];
  matchPrincipal: Principal;
}

export default function MessageList({ messages, matchPrincipal }: MessageListProps) {
  const { identity } = useInternetIdentity();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const currentUserPrincipal = identity?.getPrincipal().toString();

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-muted-foreground text-center">
          No messages yet. Start the conversation!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div ref={scrollRef} className="space-y-4">
        {messages.map((message, index) => {
          const isOwnMessage = message.from.toString() === currentUserPrincipal;

          return (
            <div
              key={index}
              className={cn(
                'flex',
                isOwnMessage ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[70%] rounded-2xl px-4 py-2',
                  isOwnMessage
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="text-sm break-words">{message.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
