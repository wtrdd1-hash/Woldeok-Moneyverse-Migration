import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { OrderbookSuperchat } from './orderbook-superchat';

describe('OrderbookSuperchat Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders initial ticker message and open button', () => {
    const { container, getByRole } = render(<OrderbookSuperchat currentSymbol="NVDA" />);

    expect(getByRole('button', { name: '📣 슈퍼챗 쏘기' })).not.toBeNull();
    expect(container.textContent).toContain('NVDA 오늘 목표가 180 돌파 가즈아');
  });

  it('opens modal and allows sending superchat message', () => {
    const handleSend = vi.fn();
    const { container, getByRole, getByPlaceholderText, getByTestId } = render(
      <OrderbookSuperchat currentSymbol="BTC" onSendSuperchat={handleSend} />
    );

    // Open modal
    const openBtn = getByRole('button', { name: '📣 슈퍼챗 쏘기' });
    fireEvent.click(openBtn);

    expect(container.textContent).toContain('호가창 실시간 골드 슈퍼챗');

    // Select 5만 preset
    const preset50k = getByRole('button', { name: '5만' });
    fireEvent.click(preset50k);

    // Enter message
    const input = getByPlaceholderText('모든 트레이더에게 전할 메시지를 입력하세요');
    fireEvent.change(input, { target: { value: '비트코인 떡상 가즈아!' } });

    // Send
    const sendBtn = getByRole('button', { name: /50,000 WLD 슈퍼챗 발송하기/i });
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
    expect(getByTestId('gold-firework-overlay')).not.toBeNull();
  });

  it('disables send button when message input is empty', () => {
    const { getByRole } = render(<OrderbookSuperchat />);

    const openBtn = getByRole('button', { name: '📣 슈퍼챗 쏘기' });
    fireEvent.click(openBtn);

    const sendBtn = getByRole('button', { name: /10,000 WLD 슈퍼챗 발송하기/i }) as HTMLButtonElement;
    expect(sendBtn.disabled).toBe(true);
  });
});
