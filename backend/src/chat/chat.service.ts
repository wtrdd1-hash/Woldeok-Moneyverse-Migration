import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  PostgresChatRepository,
  ChatInputError,
  type ConversationRow,
  type MessageRow,
  type OpenConversationResult,
  type SendMessageResult,
} from './chat.repository';

export interface SanitizedMessage {
  readonly body: string;
}

function sanitizeChatBody(input: string): string {
  // Trim and strip ASCII control characters (except common Korean and printable chars)
  const trimmed = input.trim();
  // Remove ASCII control characters 0x00-0x1F and 0x7F
  const cleaned = trimmed.replace(/[\x00-\x1F\x7F]/g, '');
  if (cleaned.length < 1 || cleaned.length > 2000) {
    throw new BadRequestException('메시지는 1자 이상 2000자 이하여야 해요.');
  }
  return cleaned;
}

@Injectable()
export class ChatService {
  constructor(private readonly repo: PostgresChatRepository) {}

  async openConversation(actorUserId: string, peerUserId: string): Promise<OpenConversationResult> {
    if (actorUserId === peerUserId) {
      throw new BadRequestException('자기 자신과는 대화할 수 없어요.');
    }
    try {
      return await this.repo.openConversation(actorUserId, peerUserId);
    } catch (error) {
      if (error instanceof ChatInputError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async sendMessage(
    actorUserId: string,
    conversationId: string,
    idempotencyKey: string,
    body: string,
  ): Promise<SendMessageResult> {
    const cleanedBody = sanitizeChatBody(body);
    try {
      return await this.repo.sendMessage(actorUserId, conversationId, idempotencyKey, cleanedBody);
    } catch (error) {
      if (error instanceof ChatInputError) {
        throw new BadRequestException(error.message);
      }
      // If Postgres throws 42501 (insufficient privilege) or 22023
      const err = error as { code?: string; message?: string };
      if (err.code === '42501') {
        throw new ForbiddenException('대화방에 참여하고 있지 않거나 대화가 제한되었어요.');
      }
      if (err.code === '22023') {
        throw new BadRequestException('메시지 내용이나 요청 형식이 올바르지 않아요.');
      }
      throw error;
    }
  }

  async markAsRead(actorUserId: string, conversationId: string, sequence: number): Promise<{ lastReadSequence: string }> {
    try {
      const lastReadSequence = await this.repo.markAsRead(actorUserId, conversationId, sequence);
      return { lastReadSequence };
    } catch (error) {
      if (error instanceof ChatInputError) {
        throw new BadRequestException(error.message);
      }
      const err = error as { code?: string };
      if (err.code === '42501') {
        throw new ForbiddenException('대화방에 참여하고 있지 않아요.');
      }
      throw error;
    }
  }

  async listConversations(actorUserId: string, limit = 50): Promise<ConversationRow[]> {
    try {
      return await this.repo.listConversations(actorUserId, limit);
    } catch (error) {
      if (error instanceof ChatInputError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async listMessages(
    actorUserId: string,
    conversationId: string,
    limit = 50,
    beforeSequence?: number,
  ): Promise<MessageRow[]> {
    try {
      const messages = await this.repo.listMessages(actorUserId, conversationId, limit, beforeSequence);
      // Return in chronological order (oldest to newest) for client convenience
      return [...messages].reverse();
    } catch (error) {
      if (error instanceof ChatInputError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async archiveConversation(actorUserId: string, conversationId: string, archived: boolean): Promise<boolean> {
    try {
      return await this.repo.archiveConversation(actorUserId, conversationId, archived);
    } catch (error) {
      if (error instanceof ChatInputError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async muteConversation(actorUserId: string, conversationId: string, muted: boolean): Promise<boolean> {
    try {
      return await this.repo.muteConversation(actorUserId, conversationId, muted);
    } catch (error) {
      if (error instanceof ChatInputError) {
        throw new BadRequestException(error.message);
      }
      const err = error as { code?: string };
      if (err.code === '42501') {
        throw new ForbiddenException('대화방에 참여하고 있지 않아요.');
      }
      throw error;
    }
  }

  async blockUser(actorUserId: string, targetUserId: string): Promise<boolean> {
    if (actorUserId === targetUserId) {
      throw new BadRequestException('자기 자신은 차단할 수 없어요.');
    }
    try {
      return await this.repo.blockUser(actorUserId, targetUserId);
    } catch (error) {
      if (error instanceof ChatInputError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async unblockUser(actorUserId: string, targetUserId: string): Promise<boolean> {
    try {
      return await this.repo.unblockUser(actorUserId, targetUserId);
    } catch (error) {
      if (error instanceof ChatInputError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async reportConversation(
    actorUserId: string,
    conversationId: string,
    reason: string,
    details: string,
  ): Promise<{ reportId: string }> {
    const trimmedDetails = details.trim();
    if (trimmedDetails.length < 2 || trimmedDetails.length > 2000) {
      throw new BadRequestException('신고 상세 사유는 2자 이상 2000자 이하여야 해요.');
    }
    try {
      return await this.repo.reportConversation(actorUserId, conversationId, reason, trimmedDetails);
    } catch (error) {
      if (error instanceof ChatInputError) {
        throw new BadRequestException(error.message);
      }
      const err = error as { code?: string };
      if (err.code === '42501') {
        throw new ForbiddenException('대화방에 참여하고 있지 않아요.');
      }
      throw error;
    }
  }

  async totalUnreadCount(actorUserId: string): Promise<number> {
    return this.repo.totalUnreadCount(actorUserId);
  }
}
