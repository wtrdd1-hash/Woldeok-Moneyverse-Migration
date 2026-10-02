import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { LocaleProvider } from '@/components/locale-provider';
import { OnboardingRoadmap } from './components/onboarding-roadmap';
import { AssetSimulator } from './components/asset-simulator';
import { OnboardingChecklist } from './components/onboarding-checklist';
import { EconomyFlowDiagram } from './components/economy-flow-diagram';
import { GlossarySearch } from './components/glossary-search';
import { PowerUserCheatSheet } from './components/power-user-cheat-sheet';

const renderKo = (ui: React.ReactElement) => render(<LocaleProvider initialLocale="ko">{ui}</LocaleProvider>);

describe('Interactive Guide Components Suite', () => {
  describe('OnboardingRoadmap', () => {
    it('renders all 5 steps and switches active step upon click', () => {
      renderKo(<OnboardingRoadmap />);
      // 5개 단계 탭 확인
      expect(screen.getByText('STEP 1')).toBeDefined();
      expect(screen.getByText('STEP 2')).toBeDefined();
      expect(screen.getByText('STEP 3')).toBeDefined();
      expect(screen.getByText('STEP 4')).toBeDefined();
      expect(screen.getByText('STEP 5')).toBeDefined();

      // 기본 1단계 활성화 확인
      expect(screen.getByText('계정 로그인 & 첫 출석 체크')).toBeDefined();

      // 2단계 클릭 전환
      fireEvent.click(screen.getByText('STEP 2'));
      expect(screen.getByText('8대 전문 직업 배정 & 첫 일거리')).toBeDefined();

      // 3단계 클릭 전환
      fireEvent.click(screen.getByText('STEP 3'));
      expect(screen.getByText('가상 은행 복리 저축 & 만기 국채')).toBeDefined();
    });
  });

  describe('AssetSimulator', () => {
    it('calculates simulated net worth with default presets', () => {
      renderKo(<AssetSimulator />);
      expect(screen.getByText('1분 모의 자산 형성 시뮬레이터')).toBeDefined();
      // 기본 30일 시뮬레이션 결과 레이블 표시 확인
      expect(screen.getByText(/30일 후 예상 총 자산/)).toBeDefined();

      // 기간 변경 (7일)
      fireEvent.click(screen.getByText('7일 (1주)'));
      expect(screen.getByText(/7일 후 예상 총 자산/)).toBeDefined();
    });
  });

  describe('OnboardingChecklist', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('renders 6 essential onboarding quests and allows toggling', () => {
      renderKo(<OnboardingChecklist />);
      expect(screen.getByText('입문 6대 온보딩 퀘스트 & 뱃지')).toBeDefined();
      expect(screen.getByText('계정 로그인 & 약관 동의')).toBeDefined();
      expect(screen.getByText('첫 출석 체크 & 일일 퀘스트')).toBeDefined();
      expect(screen.getByText('8대 직업 선택 & 첫 일거리 완수')).toBeDefined();
      expect(screen.getByText('가상 은행 복리 예금 1회 예치')).toBeDefined();
      expect(screen.getByText('가상 주식 10-Depth 호가창 조회')).toBeDefined();
      expect(screen.getByText('핀테크 핵심 금융 용어사전 열람')).toBeDefined();

      // 전체 완료 표시 클릭
      const markAllBtn = screen.getByText('전체 완료 표시');
      fireEvent.click(markAllBtn);
      expect(screen.getByText(/6 \/ 6/)).toBeDefined();
      expect(screen.getByText(/모든 퀘스트 완료/)).toBeDefined();
    });
  });

  describe('EconomyFlowDiagram', () => {
    it('renders 5 flow nodes and allows node selection', () => {
      renderKo(<EconomyFlowDiagram />);
      expect(screen.getByText('가상경제 5대 선순환 아키텍처')).toBeDefined();
      expect(screen.getByText('1. 생산 및 활동')).toBeDefined();
      expect(screen.getByText('2. 가상 금융')).toBeDefined();
      expect(screen.getByText('3. 투자 및 경영')).toBeDefined();
      expect(screen.getByText('4. 소비 및 교환')).toBeDefined();
      expect(screen.getByText('5. 국고 비축 & 자동 소각')).toBeDefined();

      // 노드 2 클릭 전환
      fireEvent.click(screen.getByText('2. 가상 금융'));
      expect(screen.getByText(/복리 예금에 자금을 예치하여/)).toBeDefined();
    });
  });

  describe('GlossarySearch', () => {
    it('filters terms based on search input and category selection', () => {
      renderKo(<GlossarySearch />);
      expect(screen.getByText('핀테크 & 게임 핵심 용어 사전')).toBeDefined();

      // 초기 목록에 복식부기 및 멱등성 존재 확인
      expect(screen.getByText('복식부기 원장')).toBeDefined();
      expect(screen.getByText('멱등성 (Idempotency)')).toBeDefined();

      // 검색어 입력
      const searchInput = screen.getByPlaceholderText(/용어 검색/);
      fireEvent.change(searchInput, { target: { value: '멱등성' } });
      expect(screen.getByText('멱등성 (Idempotency)')).toBeDefined();
      expect(screen.queryByText('복식부기 원장')).toBeNull();
    });
  });

  describe('PowerUserCheatSheet', () => {
    it('renders 4 cheat sheet domains', () => {
      renderKo(<PowerUserCheatSheet />);
      expect(screen.getByText('파워 유저를 위한 실전 꿀팁 & 치트시트')).toBeDefined();
      expect(screen.getByText('주식 거래소 쾌속 트레이딩')).toBeDefined();
      expect(screen.getByText('직업 파밍 쿨타임 최적화')).toBeDefined();
      expect(screen.getByText('복리 이자 극대화 타이밍')).toBeDefined();
      expect(screen.getByText('모바일 핀테크 터치 제스처')).toBeDefined();
    });
  });
});
