import type { Copy } from '@/lib/copy';

/**
 * Five-locale copy for the /admin/support desk. Korean is the carried-over product copy and is
 * kept byte-for-byte; `{name}` slots are filled after picking. Thread subjects, member names and
 * message bodies are data and are never translated.
 *
 * Not here on purpose: the canned reply bodies and the clipboard transcript. Both are text that
 * leaves the console (to a member, or into a pasted record), so they stay in the community's
 * language whatever the operator's interface language is; only the preset buttons are localised.
 */
export const ADMIN_SUPPORT_COPY = {
  metaTitle: { ko: '문의 채팅 · 관리자 콘솔', en: 'Support chat · Admin console', ja: 'お問い合わせチャット · 管理コンソール', zh: '咨询聊天 · 管理控制台', vi: 'Trò chuyện hỗ trợ · Bảng quản trị' },
  cannedChecking: { ko: '🔍 [확인 중]', en: '🔍 [Checking]', ja: '🔍 [確認中]', zh: '🔍 [核实中]', vi: '🔍 [Đang kiểm tra]' },
  cannedResolved: { ko: '✅ [처리 완료]', en: '✅ [Resolved]', ja: '✅ [対応完了]', zh: '✅ [已处理]', vi: '✅ [Đã xử lý]' },
  cannedMoreInfo: { ko: '📸 [추가 정보]', en: '📸 [More info]', ja: '📸 [追加情報]', zh: '📸 [补充信息]', vi: '📸 [Thêm thông tin]' },
  statusOpen: { ko: '답변 대기', en: 'Awaiting reply', ja: '返信待ち', zh: '待回复', vi: 'Chờ trả lời' },
  statusWaitingUser: { ko: '회원 답변 대기', en: 'Awaiting member', ja: '会員の返信待ち', zh: '待会员回复', vi: 'Chờ thành viên trả lời' },
  statusResolved: { ko: '처리 완료', en: 'Resolved', ja: '対応完了', zh: '已处理', vi: 'Đã xử lý' },
  justNow: { ko: '방금 전', en: 'just now', ja: 'たった今', zh: '刚刚', vi: 'vừa xong' },
  minutesAgo: { ko: '{n}분 전', en: '{n} min ago', ja: '{n}分前', zh: '{n} 分钟前', vi: '{n} phút trước' },
  hoursAgo: { ko: '{n}시간 전', en: '{n} h ago', ja: '{n}時間前', zh: '{n} 小时前', vi: '{n} giờ trước' },
  daysAgo: { ko: '{n}일 전', en: '{n} d ago', ja: '{n}日前', zh: '{n} 天前', vi: '{n} ngày trước' },
  imageTooLarge: { ko: '이미지 파일 크기는 최대 8MB까지 가능합니다.', en: 'Images can be at most 8 MB.', ja: '画像ファイルのサイズは最大8MBまでです。', zh: '图片文件最大为 8MB。', vi: 'Tệp ảnh tối đa 8MB.' },
  imageUploading: { ko: '안티바이러스 검사 및 이미지 업로드 중…', en: 'Scanning for viruses and uploading the image…', ja: 'ウイルス検査と画像アップロード中…', zh: '正在进行病毒扫描并上传图片…', vi: 'Đang quét virus và tải ảnh lên…' },
  imageAttached: { ko: '보안 검사를 통과하여 이미지가 첨부되었습니다.', en: 'The image passed the security scan and is attached.', ja: 'セキュリティ検査を通過し、画像を添付しました。', zh: '图片已通过安全检查并完成附加。', vi: 'Ảnh đã qua kiểm tra bảo mật và được đính kèm.' },
  imageUploadFailed: { ko: '업로드에 실패했습니다.', en: 'The upload failed.', ja: 'アップロードに失敗しました。', zh: '上传失败。', vi: 'Tải lên thất bại.' },
  imageNetworkError: { ko: '이미지 업로드 중 네트워크 오류가 발생했습니다.', en: 'A network error occurred while uploading the image.', ja: '画像のアップロード中にネットワークエラーが発生しました。', zh: '上传图片时发生网络错误。', vi: 'Đã xảy ra lỗi mạng khi tải ảnh lên.' },
  threadsSynced: { ko: '문의 목록이 최신 상태로 동기화되었습니다.', en: 'The support list is up to date.', ja: 'お問い合わせ一覧を最新の状態に同期しました。', zh: '咨询列表已同步至最新状态。', vi: 'Danh sách yêu cầu đã được đồng bộ mới nhất.' },
  replySaved: { ko: '관리자 답장이 서버에 저장되었습니다.', en: 'The administrator reply was saved on the server.', ja: '管理者の返信がサーバーに保存されました。', zh: '管理员回复已保存到服务器。', vi: 'Phản hồi của quản trị viên đã được lưu trên máy chủ.' },
  replyUnconfirmed: {
    ko: '서버에서 답장 저장을 확인하지 못했습니다. 다시 확인해 주세요.',
    en: 'The server did not confirm the reply was saved. Please check again.',
    ja: 'サーバーで返信の保存を確認できませんでした。もう一度確認してください。',
    zh: '未能确认服务器已保存回复。请再次确认。',
    vi: 'Máy chủ chưa xác nhận đã lưu phản hồi. Vui lòng kiểm tra lại.',
  },
  statusChanged: {
    ko: "문의 상태가 '{status}'(으)로 변경되었습니다.",
    en: "The enquiry status changed to '{status}'.",
    ja: "お問い合わせの状態を「{status}」に変更しました。",
    zh: "咨询状态已更改为“{status}”。",
    vi: "Trạng thái yêu cầu đã chuyển thành '{status}'.",
  },
  statusUnconfirmed: {
    ko: '문의 상태 변경 결과를 확인하지 못했습니다. 다시 조회해 주세요.',
    en: 'The status change could not be confirmed. Please reload.',
    ja: '状態変更の結果を確認できませんでした。再度照会してください。',
    zh: '未能确认状态更改结果。请重新查询。',
    vi: 'Không xác nhận được kết quả đổi trạng thái. Vui lòng tải lại.',
  },
  transcriptCopied: { ko: '전체 대화 내용이 클립보드에 복사되었습니다.', en: 'The whole conversation was copied to the clipboard.', ja: '会話全体をクリップボードにコピーしました。', zh: '完整对话已复制到剪贴板。', vi: 'Toàn bộ cuộc trò chuyện đã được sao chép vào bộ nhớ tạm.' },
  heading: { ko: '관리자 고객지원 관제 센터', en: 'Administrator support desk', ja: '管理者カスタマーサポート管制センター', zh: '管理员客服控制中心', vi: 'Trung tâm hỗ trợ khách hàng của quản trị' },
  threadCount: { ko: '{count}건', en: '{count}', ja: '{count}件', zh: '{count} 条', vi: '{count} mục' },
  intro: {
    ko: '회원 1:1 문의를 실시간으로 모니터링하고 신속하게 답장 및 티켓 상태를 관리합니다.',
    en: 'Monitor one-to-one member enquiries live, reply quickly and manage ticket status.',
    ja: '会員の1:1お問い合わせをリアルタイムで監視し、迅速に返信とチケット状態を管理します。',
    zh: '实时监控会员 1:1 咨询，快速回复并管理工单状态。',
    vi: 'Theo dõi trực tiếp yêu cầu 1:1 của thành viên, trả lời nhanh và quản lý trạng thái phiếu.',
  },
  pollOn: { ko: '실시간 5초 폴링 ON', en: 'Live 5-second polling ON', ja: 'リアルタイム5秒ポーリングON', zh: '实时 5 秒轮询 开', vi: 'Thăm dò 5 giây BẬT' },
  pollPaused: { ko: '폴링 일시정지', en: 'Polling paused', ja: 'ポーリング一時停止', zh: '轮询已暂停', vi: 'Tạm dừng thăm dò' },
  refresh: { ko: '새로고침', en: 'Refresh', ja: '更新', zh: '刷新', vi: 'Làm mới' },
  tabAll: { ko: '전체', en: 'All', ja: 'すべて', zh: '全部', vi: 'Tất cả' },
  tabOpen: { ko: '답변 대기', en: 'Awaiting reply', ja: '返信待ち', zh: '待回复', vi: 'Chờ trả lời' },
  tabWaitingUser: { ko: '회원 대기', en: 'Awaiting member', ja: '会員待ち', zh: '待会员', vi: 'Chờ thành viên' },
  tabResolved: { ko: '완료', en: 'Resolved', ja: '完了', zh: '已完成', vi: 'Hoàn tất' },
  searchAria: { ko: '문의 검색', en: 'Search enquiries', ja: 'お問い合わせ検索', zh: '搜索咨询', vi: 'Tìm yêu cầu' },
  searchPlaceholder: { ko: '회원 닉네임, 문의 제목 검색...', en: 'Search member nickname or subject...', ja: '会員ニックネーム、お問い合わせ件名を検索...', zh: '搜索会员昵称、咨询标题...', vi: 'Tìm biệt danh thành viên, tiêu đề yêu cầu...' },
  noMatch: { ko: '검색 조건과 일치하는 문의가 없습니다.', en: 'No enquiries match your search.', ja: '検索条件に一致するお問い合わせはありません。', zh: '没有符合搜索条件的咨询。', vi: 'Không có yêu cầu nào khớp với tìm kiếm.' },
  noThreads: { ko: '접수된 문의가 없습니다.', en: 'No enquiries have been received.', ja: '受け付けたお問い合わせはありません。', zh: '暂无已受理的咨询。', vi: 'Chưa có yêu cầu nào được tiếp nhận.' },
  lastActivity: { ko: '최근: {when}', en: 'Latest: {when}', ja: '最新: {when}', zh: '最近：{when}', vi: 'Gần nhất: {when}' },
  memberLabel: { ko: '회원:', en: 'Member:', ja: '会員:', zh: '会员：', vi: 'Thành viên:' },
  copied: { ko: '복사됨', en: 'Copied', ja: 'コピー済み', zh: '已复制', vi: 'Đã sao chép' },
  copyTranscript: { ko: '대화 복사', en: 'Copy conversation', ja: '会話をコピー', zh: '复制对话', vi: 'Sao chép cuộc trò chuyện' },
  adminSender: { ko: '🛡️ 관리자 (운영팀)', en: '🛡️ Administrator (operations team)', ja: '🛡️ 管理者（運営チーム）', zh: '🛡️ 管理员（运营团队）', vi: '🛡️ Quản trị viên (đội vận hành)' },
  quickPresets: { ko: '빠른 상용구:', en: 'Quick replies:', ja: 'クイック定型文:', zh: '快捷用语：', vi: 'Trả lời nhanh:' },
  removeAttachment: { ko: '첨부 이미지 삭제', en: 'Remove attached image', ja: '添付画像を削除', zh: '删除附加图片', vi: 'Xóa ảnh đính kèm' },
  replyPlaceholder: {
    ko: '관리자 답장을 입력하세요... (이미지 붙여넣기 Ctrl+V 또는 클립 아이콘)',
    en: 'Type the administrator reply... (paste an image with Ctrl+V or use the clip icon)',
    ja: '管理者の返信を入力してください...（画像の貼り付けはCtrl+Vまたはクリップアイコン）',
    zh: '请输入管理员回复...（可用 Ctrl+V 粘贴图片或点击回形针图标）',
    vi: 'Nhập phản hồi của quản trị viên... (dán ảnh bằng Ctrl+V hoặc biểu tượng kẹp giấy)',
  },
  attachImage: { ko: '이미지 파일 첨부', en: 'Attach image file', ja: '画像ファイルを添付', zh: '附加图片文件', vi: 'Đính kèm tệp ảnh' },
  attachImageTitle: { ko: '이미지 파일 첨부 (최대 8MB, 보안 스캔)', en: 'Attach image file (max 8 MB, security scanned)', ja: '画像ファイルを添付（最大8MB、セキュリティスキャン）', zh: '附加图片文件（最大 8MB，安全扫描）', vi: 'Đính kèm tệp ảnh (tối đa 8MB, quét bảo mật)' },
  sending: { ko: '전송 중...', en: 'Sending...', ja: '送信中...', zh: '发送中...', vi: 'Đang gửi...' },
  reply: { ko: '답장', en: 'Reply', ja: '返信', zh: '回复', vi: 'Trả lời' },
  optionOpen: { ko: '답변 대기 (open)', en: 'Awaiting reply (open)', ja: '返信待ち (open)', zh: '待回复 (open)', vi: 'Chờ trả lời (open)' },
  optionWaitingUser: { ko: '회원 답변 대기 (waiting_user)', en: 'Awaiting member (waiting_user)', ja: '会員の返信待ち (waiting_user)', zh: '待会员回复 (waiting_user)', vi: 'Chờ thành viên trả lời (waiting_user)' },
  optionResolved: { ko: '처리 완료 (resolved)', en: 'Resolved (resolved)', ja: '対応完了 (resolved)', zh: '已处理 (resolved)', vi: 'Đã xử lý (resolved)' },
  changing: { ko: '변경 중...', en: 'Changing...', ja: '変更中...', zh: '更改中...', vi: 'Đang thay đổi...' },
  changeStatus: { ko: '상태 변경', en: 'Change status', ja: '状態を変更', zh: '更改状态', vi: 'Đổi trạng thái' },
  emptyTitle: { ko: '문의가 없습니다.', en: 'There are no enquiries.', ja: 'お問い合わせはありません。', zh: '没有咨询。', vi: 'Không có yêu cầu.' },
  emptyHint: {
    ko: '좌측 목록에서 문의를 선택하거나 새 문의를 기다려 주세요.',
    en: 'Pick an enquiry from the list or wait for a new one.',
    ja: '左の一覧からお問い合わせを選択するか、新しいお問い合わせをお待ちください。',
    zh: '请从左侧列表选择咨询，或等待新的咨询。',
    vi: 'Chọn một yêu cầu trong danh sách bên trái hoặc chờ yêu cầu mới.',
  },
} as const satisfies Record<string, Copy>;

export type AdminSupportCopyKey = keyof typeof ADMIN_SUPPORT_COPY;
