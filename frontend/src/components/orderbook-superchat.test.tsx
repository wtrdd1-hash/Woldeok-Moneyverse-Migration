import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderbookSuperchat } from './orderbook-superchat';

describe('OrderbookSuperchat Component', () => {
  it('renders initial ticker message and open button', () => {
    render(<OrderbookSuperchat currentSymbol="NVDA" />);

    expect(screen.getByText('📣 슈퍼챗 쏘기')).toBeInTheDocument();
    expect(screen.getByText(/NVDA 오늘 목표가 180 돌파 가즈아/i)).toBeInTheDocument();
  });

  it('opens modal and allows sending superchat message', () => {
    const handleSend = vi.fn();
    render(<OrderbookSuperchat currentSymbol="BTC" onSendSuperchat={handleSend} />);

    // Open modal
    const openBtn = screen.getByRole('button', { name: '📣 슈퍼챗 쏘기' });
    fireEvent.click(openBtn);

    expect(screen.getByText('호가창 실시간 골드 슈퍼챗')).toBeInTheDocument();

    // Select 5만 preset
    const preset50k = screen.getByRole('button', { name: '5만' });
    fireEvent.click(preset50k);

    // Enter message
    const input = screen.getByPlaceholderText('모든 트레이더에게 전할 메시지를 입력하세요');
    fireEvent.change(input, { target: { value: '비트코인 떡상 가즈아!' } });

    // Send
    const sendBtn = screen.getByRole('button', { name: /50,000 WLD 슈퍼챗 발송하기/i });
    fireEvent.click(sendBtn);

    expect(handleSend).toHaveBeenCalledTimes(1);
    expect(handleSend).toHaveBeenCalledWith({
      sender: '나 (You)',
      amount: 50000,
      message: '비트코인 떡상 가즈아!',
      symbol: 'BTC',
      tier: 'gold',
    });

    // Fireworks overlay appears
    expect(screen.getByTestId('gold-firework-overlay')).toBeInTheDocument();
  });

  it('disables send button when message input is empty', () => {
    render(<OrderbookSuperchat />);

    const openBtn = screen.getByRole('button', { name: '📣 슈퍼챗 쏘기' });
    fireEvent.click(openBtn);

    const sendBtn = screen.getByRole('button', { name: /10,000 WLD 슈퍼챗 발송하기/i });
    expect(sendBtn).toBeDisabled();
  });
});
