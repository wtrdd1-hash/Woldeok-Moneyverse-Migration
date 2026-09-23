'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface ClubDetail {
  readonly id: string;
  readonly tag: string;
  readonly name: string;
  readonly description: string;
  readonly charter: string;
  readonly owner_id: string;
  readonly owner_name: string;
  readonly join_mode: string;
  readonly status: string;
  readonly level: number;
  readonly experience: string;
  readonly member_count: number;
  readonly is_my_club: boolean;
  readonly my_role: string | null;
}

export interface ClubProject {
  readonly id: string;
  readonly club_id: string;
  readonly title: string;
  readonly description: string;
  readonly target_wld: string;
  readonly current_wld: string;
  readonly status: string;
  readonly reward_badge: string | null;
  readonly progress_percent: number;
}

export interface ClubFeedPost {
  readonly id: string;
  readonly club_id: string;
  readonly author_id: string;
  readonly author_name: string;
  readonly title: string;
  readonly body: string;
  readonly is_announcement: boolean;
  readonly created_at: string;
}

import { ClubhouseCanvas } from './clubhouse-canvas';

export function ClubhouseView({
  club,
  projects,
  feed,
}: {
  readonly club: ClubDetail;
  readonly projects: ClubProject[];
  readonly feed: ClubFeedPost[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'projects' | 'feed' | 'canvas' | 'charter'>('canvas');

  // 프로젝트 펀딩 상태
  const [selectedProject, setSelectedProject] = useState<ClubProject | null>(null);
  const [contributeAmount, setContributeAmount] = useState('1000');
  const [isFunding, setIsFunding] = useState(false);
  const [fundError, setFundError] = useState<string | null>(null);

  // 피드 글 작성 상태
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // 가입/탈퇴 처리
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const res = await fetch(`/api/v1/clubs/${club.id}/join`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || '가입에 실패했습니다.');
      }
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('정말 이 클럽에서 탈퇴하시겠습니까?')) return;
    setIsJoining(true);
    try {
      const res = await fetch(`/api/v1/clubs/${club.id}/leave`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || '탈퇴에 실패했습니다.');
      }
      router.push('/clubs');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsJoining(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    const amount = Number.parseInt(contributeAmount, 10);
    if (Number.isNaN(amount) || amount <= 0) {
      setFundError('기여할 WLD 금액을 올바르게 입력하세요.');
      return;
    }

    const confirmed = window.confirm(
      `${amount.toLocaleString()} WLD를 이 협동 프로젝트에 기여(영구 소각 SINK_CLUB_PROJECT)하시겠습니까?\n이 자금은 반환되지 않으며 클럽 랜드마크 해금에 사용됩니다.`,
    );
    if (!confirmed) return;

    setIsFunding(true);
    setFundError(null);
    try {
      const res = await fetch(`/api/v1/clubs/${club.id}/projects/${selectedProject.id}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountWld: amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || '펀딩 기여에 실패했습니다.');
      }
      setSelectedProject(null);
      router.refresh();
    } catch (err: unknown) {
      setFundError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsFunding(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) return;

    setIsPosting(true);
    try {
      const res = await fetch(`/api/v1/clubs/${club.id}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle.trim(),
          body: postBody.trim(),
          isAnnouncement,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '글 등록에 실패했습니다.');

      setPostTitle('');
      setPostBody('');
      setIsAnnouncement(false);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsPosting(false);
    }
  };

  const isLeader = club.my_role === 'owner' || club.my_role === 'steward';

  return (
    <div className="space-y-6">
      {/* 클럽 상단 배너 카드 */}
      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold bg-primary/10 text-primary px-2.5 py-1 rounded border border-primary/20">
                [{club.tag}]
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{club.name}</h1>
              <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                Lv.{club.level}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{club.description || '클럽 소개글이 없습니다.'}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/clubs/${club.id}/members`}
              className="inline-flex items-center gap-1.5 bg-muted text-foreground hover:bg-muted/80 font-medium px-4 py-2 rounded-lg text-sm transition-colors border border-border"
            >
              
              <span>회원 명부 ({club.member_count}명)</span>
            </Link>

            {club.is_my_club ? (
              club.my_role !== 'owner' && (
                <button
                  type="button"
                  onClick={handleLeave}
                  disabled={isJoining}
                  className="text-xs text-destructive hover:bg-destructive/10 border border-destructive/30 px-3 py-2 rounded-lg font-medium transition-colors"
                >
                  클럽 탈퇴
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={handleJoin}
                disabled={isJoining}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-5 py-2 rounded-lg text-sm transition-colors shadow-sm"
              >
                {isJoining ? '처리 중...' : '클럽 가입하기'}
              </button>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-border flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
          <div>클럽장: <span className="text-foreground font-semibold">{club.owner_name}</span></div>
          <div>누적 경험치: <span className="text-foreground font-semibold">{Number(club.experience).toLocaleString()} EXP</span></div>
          <div>내 역할: <span className="text-primary font-semibold uppercase">{club.my_role || '비회원'}</span></div>
          <div>가입 방식: <span className="text-foreground font-semibold">{club.join_mode}</span></div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-border gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('canvas')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'canvas'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          공유 캔버스 (12x12)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'projects'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          협동 프로젝트 ({projects.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'feed'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          클럽 소통 피드 ({feed.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('charter')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'charter'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          클럽 헌장
        </button>
      </div>

      {/* 0. 클럽하우스 공유 캔버스 12x12 탭 */}
      {activeTab === 'canvas' && (
        <ClubhouseCanvas
          clubId={club.id}
          clubName={club.name}
          userRole={club.my_role}
        />
      )}

      {/* 1. 협동 프로젝트 탭 */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              
              <span>
                <strong>Pay-to-Win 배제 원칙:</strong> 프로젝트 기여는 순수한 협동 목표 및 명예/외형 해금에만 사용되며, 게임 내 개인 스펙에는 영향을 주지 않습니다.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((project) => {
              const current = Number.parseInt(project.current_wld, 10);
              const target = Number.parseInt(project.target_wld, 10);
              const isCompleted = project.status === 'completed';

              return (
                <div
                  key={project.id}
                  className={`bg-card border rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between ${
                    isCompleted ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base">{project.title}</h3>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-primary/20 text-primary'
                        }`}
                      >
                        {isCompleted ? '완료됨' : '펀딩 진행 중'}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {project.description || '프로젝트 설명이 없습니다.'}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* 프로그레스 바 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>달성률: {project.progress_percent}%</span>
                        <span>
                          {current.toLocaleString()} / {target.toLocaleString()} WLD
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-primary'
                          }`}
                          style={{ width: `${project.progress_percent}%` }}
                        />
                      </div>
                    </div>

                    {/* 기여 액션 */}
                    {!isCompleted && club.is_my_club && (
                      <button
                        type="button"
                        onClick={() => setSelectedProject(project)}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 rounded-lg text-xs transition-colors shadow-sm"
                      >
                        WLD 협동 펀딩 기여하기 (소각)
                      </button>
                    )}

                    {isCompleted && (
                      <div className="text-center py-1 text-xs text-emerald-500 font-semibold flex items-center justify-center gap-1">
                        
                        <span>거점 구축 완료 (해금 뱃지: {project.reward_badge || 'PIONEER'})</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. 클럽 소통 피드 탭 */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* 글 작성 폼 (회원만 가능) */}
          {club.is_my_club ? (
            <form onSubmit={handleCreatePost} className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold">클럽원들과 소통하기</h3>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="제목을 입력하세요..."
                required
                maxLength={100}
                className="w-full bg-muted/50 border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                rows={3}
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
                placeholder="클럽원들에게 공유할 내용이나 활동 소식을 적어주세요."
                required
                maxLength={2000}
                className="w-full bg-muted/50 border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />

              <div className="flex items-center justify-between">
                {isLeader ? (
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnnouncement}
                      onChange={(e) => setIsAnnouncement(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                    <span>중요 공지사항으로 등록</span>
                  </label>
                ) : <div />}

                <button
                  type="submit"
                  disabled={isPosting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-4 py-2 rounded-lg text-xs transition-colors"
                >
                  {isPosting ? '등록 중...' : '게시글 등록'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 bg-muted/30 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
              클럽 회원만 피드에 글을 작성할 수 있습니다.
            </div>
          )}

          {/* 피드 목록 */}
          <div className="space-y-4">
            {feed.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                아직 등록된 게시글이 없습니다. 첫 번째 소식을 남겨보세요!
              </div>
            ) : (
              feed.map((post) => (
                <div
                  key={post.id}
                  className={`bg-card border rounded-xl p-5 space-y-2 shadow-sm ${
                    post.is_announcement ? 'border-amber-500/40 bg-amber-500/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {post.is_announcement && (
                        <span className="text-[11px] font-bold bg-amber-500 text-black px-2 py-0.5 rounded">
                          공지
                        </span>
                      )}
                      <h4 className="font-bold text-sm">{post.title}</h4>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>

                  <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {post.body}
                  </p>

                  <div className="pt-2 text-[11px] text-muted-foreground border-t border-border/50">
                    작성자: <span className="font-medium text-foreground">{post.author_name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. 클럽 헌장 탭 */}
      {activeTab === 'charter' && (
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="text-base font-bold flex items-center gap-2">
            
            <span>클럽 헌장 및 강령</span>
          </h3>
          <div className="p-4 bg-muted/40 rounded-lg border border-border/60 text-sm whitespace-pre-wrap leading-relaxed text-foreground/90 font-serif">
            {club.charter || '선포된 헌장이 없습니다.'}
          </div>
        </div>
      )}

      {/* 펀딩 기여 모달 */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold">협동 프로젝트 펀딩</h3>
            <p className="text-xs text-muted-foreground">
              [{selectedProject.title}] 프로젝트에 출자할 WLD 금액을 입력하세요.
            </p>

            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-xs text-amber-500 font-medium">
              출자된 WLD는 즉시 영구 소각(SINK_CLUB_PROJECT)되며, 완료 시 클럽 명예 랜드마크로 전환됩니다.
            </div>

            {fundError && (
              <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                {fundError}
              </div>
            )}

            <form onSubmit={handleContribute} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">출자 금액 (WLD)</label>
                <input
                  type="number"
                  min={1}
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full bg-muted border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isFunding}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm"
                >
                  {isFunding ? '처리 중...' : '소각 출자 확인'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
