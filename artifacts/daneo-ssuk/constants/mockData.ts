// Mock data for 단어쑥 MVP

export interface Word {
  id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  exampleKorean: string;
  idiom: string;
  idiomMeaning: string;
  memoryTip: string;
  level: "elementary" | "middle" | "high";
  grade: number;
  unit: number;
  relatedWords?: string[]; // IDs of related words
}

export interface SavedWord {
  wordId: string;
  savedAt: string;
}

export interface Review {
  wordId: string;
  nextReview: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export const MOCK_WORDS: Word[] = [
  // ── 초등학교 ───────────────────────────────────────────────────────────────
  {
    id: "e1",
    word: "apple",
    pronunciation: "/ˈæpəl/",
    meaning: "사과",
    example: "I eat an apple every day.",
    exampleKorean: "나는 매일 사과를 먹습니다.",
    idiom: "an apple a day",
    idiomMeaning: "하루 사과 하나면 의사가 필요 없다",
    memoryTip: "\"애플\" - 에이(A)=사과 모양! 에이플 → 사과",
    level: "elementary",
    grade: 3,
    unit: 1,
    relatedWords: ["e2", "e3"],
  },
  {
    id: "e2",
    word: "book",
    pronunciation: "/bʊk/",
    meaning: "책",
    example: "I read a book before sleeping.",
    exampleKorean: "나는 자기 전에 책을 읽습니다.",
    idiom: "hit the books",
    idiomMeaning: "열심히 공부하다",
    memoryTip: "\"북\" - 북(North)쪽에 책이 쌓여있다 → 책",
    level: "elementary",
    grade: 3,
    unit: 1,
    relatedWords: ["e1", "e4"],
  },
  {
    id: "e3",
    word: "friend",
    pronunciation: "/frend/",
    meaning: "친구",
    example: "She is my best friend.",
    exampleKorean: "그녀는 나의 가장 친한 친구입니다.",
    idiom: "make friends",
    idiomMeaning: "친구를 사귀다",
    memoryTip: "\"프렌드\" - 프렌(fried)=프라이드 치킨, 드=드세요! 치킨 드시면 친구! → 친구",
    level: "elementary",
    grade: 3,
    unit: 2,
    relatedWords: ["e5", "e1"],
  },
  {
    id: "e4",
    word: "school",
    pronunciation: "/skuːl/",
    meaning: "학교",
    example: "I go to school every weekday.",
    exampleKorean: "나는 매일 평일에 학교에 갑니다.",
    idiom: "old school",
    idiomMeaning: "옛날 방식의",
    memoryTip: "\"스쿨\" - 스(쓰)+쿨(cool)=멋지게 쓰는 곳 → 학교",
    level: "elementary",
    grade: 3,
    unit: 2,
    relatedWords: ["e2", "e3"],
  },
  {
    id: "e5",
    word: "family",
    pronunciation: "/ˈfæməli/",
    meaning: "가족",
    example: "My family goes on trips together.",
    exampleKorean: "나의 가족은 함께 여행을 갑니다.",
    idiom: "family man",
    idiomMeaning: "가정적인 사람",
    memoryTip: "\"패밀리\" - 파(아빠)+밀(엄마)+리(나) → 가족 세 명 모여 가족!",
    level: "elementary",
    grade: 4,
    unit: 1,
    relatedWords: ["e3", "e4"],
  },
  {
    id: "e6",
    word: "curious",
    pronunciation: "/ˈkjʊəriəs/",
    meaning: "호기심 많은, 궁금한",
    example: "Children are naturally curious about the world.",
    exampleKorean: "아이들은 세상에 대해 자연스럽게 호기심이 많습니다.",
    idiom: "curiosity killed the cat",
    idiomMeaning: "호기심이 지나치면 위험하다",
    memoryTip: "\"큐리어스\" - 큐=큐브처럼 궁금한 모양, 리어스=리어(뒤)가 궁금하다! → 호기심 많은",
    level: "elementary",
    grade: 5,
    unit: 1,
    relatedWords: ["e5", "e4"],
  },
  {
    id: "e7",
    word: "friendship",
    pronunciation: "/ˈfrendʃɪp/",
    meaning: "우정, 친구 관계",
    example: "True friendship is a precious gift.",
    exampleKorean: "진정한 우정은 소중한 선물입니다.",
    idiom: "a friend in need is a friend indeed",
    idiomMeaning: "어려울 때 친구가 진정한 친구",
    memoryTip: "\"프렌드십\" - 프렌드=친구, 십=열 명 → 친구 열 명이 있다 → 우정!",
    level: "elementary",
    grade: 4,
    unit: 2,
    relatedWords: ["e3", "e5"],
  },
  {
    id: "e8",
    word: "environment",
    pronunciation: "/ɪnˈvaɪrənmənt/",
    meaning: "환경",
    example: "We must protect the environment.",
    exampleKorean: "우리는 환경을 보호해야 합니다.",
    idiom: "go green",
    idiomMeaning: "친환경적으로 행동하다",
    memoryTip: "\"인바이런먼트\" - 인=안에, 바이=옆에, 런=달리는, 먼트=먼지 → 주변 환경",
    level: "elementary",
    grade: 6,
    unit: 3,
    relatedWords: ["e6", "e5"],
  },

  // ── 중학교 ────────────────────────────────────────────────────────────────
  {
    id: "m1",
    word: "important",
    pronunciation: "/ɪmˈpɔːrtənt/",
    meaning: "중요한",
    example: "It is important to study every day.",
    exampleKorean: "매일 공부하는 것이 중요합니다.",
    idiom: "of importance",
    idiomMeaning: "중요한",
    memoryTip: "\"임포턴트\" - 임(임금)=중요한 임금, 포(포대)=중요한 물건 포대에 넣다! → 중요한",
    level: "middle",
    grade: 7,
    unit: 1,
    relatedWords: ["m2", "m3"],
  },
  {
    id: "m2",
    word: "problem",
    pronunciation: "/ˈprɒbləm/",
    meaning: "문제, 어려움",
    example: "We need to solve this problem together.",
    exampleKorean: "우리는 이 문제를 함께 해결해야 합니다.",
    idiom: "no problem",
    idiomMeaning: "문제없어",
    memoryTip: "\"프라블럼\" - 프라(프라이팬)+블럼(블루+엄마)=엄마가 프라이팬으로 문제 해결! → 문제",
    level: "middle",
    grade: 7,
    unit: 2,
    relatedWords: ["m1", "m4"],
  },
  {
    id: "m3",
    word: "remember",
    pronunciation: "/rɪˈmembər/",
    meaning: "기억하다",
    example: "Please remember to bring your homework.",
    exampleKorean: "숙제를 가져오는 것을 기억하세요.",
    idiom: "remember by heart",
    idiomMeaning: "외우다",
    memoryTip: "\"리멤버\" - 리(re)=다시, 멤버(member)=회원 → 다시 회원으로 기억된다 → 기억하다",
    level: "middle",
    grade: 8,
    unit: 1,
    relatedWords: ["m1", "m5"],
  },
  {
    id: "m4",
    word: "enough",
    pronunciation: "/ɪˈnʌf/",
    meaning: "충분한, 충분히",
    example: "Do you have enough time to finish?",
    exampleKorean: "끝낼 시간이 충분히 있나요?",
    idiom: "enough is enough",
    idiomMeaning: "이제 그만",
    memoryTip: "\"이너프\" - 이(이미)+너프(너프건)=이미 너프건이 충분히 많다 → 충분한",
    level: "middle",
    grade: 8,
    unit: 2,
    relatedWords: ["m2", "m1"],
  },
  {
    id: "m5",
    word: "example",
    pronunciation: "/ɪɡˈzɑːmpəl/",
    meaning: "예시, 본보기",
    example: "Can you give me an example?",
    exampleKorean: "예시를 하나 들어줄 수 있나요?",
    idiom: "set an example",
    idiomMeaning: "모범을 보이다",
    memoryTip: "\"이그잼플\" - 이그(EG)=예를 들어(e.g.), 잼플=잼처럼 달콤한 예시 → 예시",
    level: "middle",
    grade: 9,
    unit: 1,
    relatedWords: ["m3", "m1"],
  },
  {
    id: "m6",
    word: "atmosphere",
    pronunciation: "/ˈætməsfɪr/",
    meaning: "대기, 분위기",
    example: "The restaurant had a wonderful atmosphere.",
    exampleKorean: "그 레스토랑은 훌륭한 분위기를 가지고 있었습니다.",
    idiom: "in the air",
    idiomMeaning: "분위기가 감돌다",
    memoryTip: "\"앳모스피어\" - 앳=~에서, 모스=모스부호, 피어=두려움 → 공기 속 분위기",
    level: "middle",
    grade: 7,
    unit: 4,
    relatedWords: ["m2", "m4"],
  },
  {
    id: "m7",
    word: "abundant",
    pronunciation: "/əˈbʌndənt/",
    meaning: "풍부한, 많은",
    example: "The region has abundant natural resources.",
    exampleKorean: "그 지역은 풍부한 천연 자원을 보유하고 있습니다.",
    idiom: "in abundance",
    idiomMeaning: "풍부하게",
    memoryTip: "\"어번던트\" - A+번+던트 → \"에이, 번데기가 던져질 만큼 많다!\" → 풍부한",
    level: "middle",
    grade: 8,
    unit: 2,
    relatedWords: ["m4", "m1"],
  },
  {
    id: "m8",
    word: "courage",
    pronunciation: "/ˈkɜːrɪdʒ/",
    meaning: "용기",
    example: "It takes courage to speak the truth.",
    exampleKorean: "진실을 말하는 것은 용기가 필요합니다.",
    idiom: "take heart",
    idiomMeaning: "용기를 내다",
    memoryTip: "\"커리지\" - 커피처럼 쓴 것을 용감하게 마신다 → 용기",
    level: "middle",
    grade: 9,
    unit: 1,
    relatedWords: ["m3", "m5"],
  },

  // ── 고등학교 ──────────────────────────────────────────────────────────────
  {
    id: "h1",
    word: "analyze",
    pronunciation: "/ˈænəlaɪz/",
    meaning: "분석하다",
    example: "Scientists analyze data to find patterns.",
    exampleKorean: "과학자들은 패턴을 찾기 위해 데이터를 분석합니다.",
    idiom: "break down",
    idiomMeaning: "분석하다, 분해하다",
    memoryTip: "\"애널라이즈\" - 애널=분석(anal)시스, 라이즈=떠오른다 → 분석해서 아이디어가 떠오른다 → 분석하다",
    level: "high",
    grade: 10,
    unit: 1,
    relatedWords: ["h2", "h3"],
  },
  {
    id: "h2",
    word: "evidence",
    pronunciation: "/ˈevɪdəns/",
    meaning: "증거, 근거",
    example: "There is strong evidence to support this theory.",
    exampleKorean: "이 이론을 뒷받침하는 강력한 증거가 있습니다.",
    idiom: "in evidence",
    idiomMeaning: "눈에 띄는",
    memoryTip: "\"에비던스\" - 에비(에비앙)=물처럼 명확한, 던스=던져진 → 명확하게 던져진 증거 → 증거",
    level: "high",
    grade: 10,
    unit: 2,
    relatedWords: ["h1", "h4"],
  },
  {
    id: "h3",
    word: "concept",
    pronunciation: "/ˈkɒnsept/",
    meaning: "개념, 생각",
    example: "This is a difficult concept to understand.",
    exampleKorean: "이것은 이해하기 어려운 개념입니다.",
    idiom: "grasp a concept",
    idiomMeaning: "개념을 이해하다",
    memoryTip: "\"컨셉트\" - 컨(corn)=옥수수, 셉트(sept)=7개 → 옥수수 7개의 개념! → 개념",
    level: "high",
    grade: 10,
    unit: 3,
    relatedWords: ["h1", "h5"],
  },
  {
    id: "h4",
    word: "structure",
    pronunciation: "/ˈstrʌktʃər/",
    meaning: "구조, 구성",
    example: "The structure of this essay is very clear.",
    exampleKorean: "이 에세이의 구조가 매우 명확합니다.",
    idiom: "power structure",
    idiomMeaning: "권력 구조",
    memoryTip: "\"스트럭처\" - 스트(street)=거리, 럭처(lecture)=강의 → 거리의 강의 구조물 → 구조",
    level: "high",
    grade: 11,
    unit: 2,
    relatedWords: ["h2", "h3"],
  },
  {
    id: "h5",
    word: "significant",
    pronunciation: "/sɪɡˈnɪfɪkənt/",
    meaning: "중요한, 상당한",
    example: "There has been a significant improvement.",
    exampleKorean: "상당한 개선이 있었습니다.",
    idiom: "significantly different",
    idiomMeaning: "크게 다른",
    memoryTip: "\"시그니피컨트\" - 시그(signal)=신호, 니피(nippy)=날카로운, 컨트=컨트롤 → 신호 컨트롤이 중요하다 → 중요한",
    level: "high",
    grade: 11,
    unit: 3,
    relatedWords: ["h3", "h4"],
  },
  {
    id: "h6",
    word: "perseverance",
    pronunciation: "/ˌpɜːrsɪˈvɪərəns/",
    meaning: "인내, 끈기",
    example: "Success requires perseverance and hard work.",
    exampleKorean: "성공은 인내와 노력을 필요로 합니다.",
    idiom: "stick to it",
    idiomMeaning: "끝까지 해내다",
    memoryTip: "\"퍼서비어런스\" - 퍼=파서, 비어=비어있는, 런스=달린다. 비어있는 곳을 파서 달린다 → 끝까지 인내!",
    level: "high",
    grade: 11,
    unit: 3,
    relatedWords: ["h5", "h4"],
  },
  {
    id: "h7",
    word: "innovative",
    pronunciation: "/ˈɪnəveɪtɪv/",
    meaning: "혁신적인",
    example: "The company launched an innovative new product.",
    exampleKorean: "그 회사는 혁신적인 신제품을 출시했습니다.",
    idiom: "think outside the box",
    idiomMeaning: "창의적으로 생각하다",
    memoryTip: "\"이노베이티브\" - 이노=이 노래, 베이=베이스, 티브 → 이 노래 베이스가 혁신적이야!",
    level: "high",
    grade: 10,
    unit: 5,
    relatedWords: ["h1", "h3"],
  },
];

export const TEXTBOOK_STRUCTURE = {
  elementary: {
    label: "초등학교",
    grades: [3, 4, 5, 6],
    unitsPerGrade: 8,
  },
  middle: {
    label: "중학교",
    grades: [7, 8, 9],
    unitsPerGrade: 10,
  },
  high: {
    label: "고등학교",
    grades: [10, 11, 12],
    unitsPerGrade: 12,
  },
};

export const POPULAR_WORDS = ["apple", "important", "analyze", "courage", "environment"];

// Curated demo scan words (present across levels for variety)
export const DEMO_SCAN_WORDS = [
  { word: "apple", id: "e1" },
  { word: "important", id: "m1" },
  { word: "analyze", id: "h1" },
  { word: "friendship", id: "e7" },
  { word: "significant", id: "h5" },
  { word: "remember", id: "m3" },
];

export const getWordsByLevel = (level: "elementary" | "middle" | "high") =>
  MOCK_WORDS.filter((w) => w.level === level);

export const getWordsByGradeAndUnit = (grade: number, unit: number) =>
  MOCK_WORDS.filter((w) => w.grade === grade && w.unit === unit);

export const getWordById = (id: string) => MOCK_WORDS.find((w) => w.id === id);

export const getRelatedWords = (word: Word) =>
  (word.relatedWords ?? [])
    .map((id) => MOCK_WORDS.find((w) => w.id === id))
    .filter(Boolean) as Word[];

export const getLevelLabel = (level: "elementary" | "middle" | "high") =>
  level === "elementary" ? "초등" : level === "middle" ? "중등" : "고등";

export const formatNextReview = (isoDate: string): string => {
  const next = new Date(isoDate);
  const now = new Date();
  const diffMs = next.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (diffDays <= 0) return "오늘";
  if (diffDays === 1) return "내일";
  if (diffDays < 7) return `${diffDays}일 후`;
  if (diffDays < 14) return "1주 후";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 후`;
  return "1달 후";
};
