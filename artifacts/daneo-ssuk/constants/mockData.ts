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
}

export interface SavedWord {
  wordId: string;
  savedAt: string;
}

export interface Review {
  wordId: string;
  nextReview: string;
  interval: number; // days
  easeFactor: number;
  repetitions: number;
}

export const MOCK_WORDS: Word[] = [
  {
    id: "1",
    word: "perseverance",
    pronunciation: "/ˌpɜːrsɪˈvɪərəns/",
    meaning: "인내, 끈기",
    example: "Success requires perseverance and hard work.",
    exampleKorean: "성공은 인내와 노력을 필요로 합니다.",
    idiom: "stick to it",
    idiomMeaning: "끝까지 해내다",
    memoryTip: "\"퍼서비어런스\" - 퍼(서)=파서, 비어=비어있는, 런스=달린다. 비어있는 곳을 파서 달린다 → 끝까지 인내!",
    level: "high",
    grade: 11,
    unit: 3,
  },
  {
    id: "2",
    word: "abundant",
    pronunciation: "/əˈbʌndənt/",
    meaning: "풍부한, 많은",
    example: "The region has abundant natural resources.",
    exampleKorean: "그 지역은 풍부한 천연 자원을 보유하고 있습니다.",
    idiom: "in abundance",
    idiomMeaning: "풍부하게",
    memoryTip: "\"어번던트\" - A(에이)+번(번)+던트 → \"에이, 번데기가 던져질 만큼 많다!\" → 풍부한",
    level: "middle",
    grade: 8,
    unit: 2,
  },
  {
    id: "3",
    word: "curious",
    pronunciation: "/ˈkjʊəriəs/",
    meaning: "호기심 많은, 궁금한",
    example: "Children are naturally curious about the world.",
    exampleKorean: "아이들은 세상에 대해 자연스럽게 호기심이 많습니다.",
    idiom: "curiosity killed the cat",
    idiomMeaning: "호기심이 지나치면 위험하다",
    memoryTip: "\"큐리어스\" - 큐(큐)=큐브처럼 궁금한 모양, 리어스=리어(뒤)가 궁금하다! → 호기심 많은",
    level: "elementary",
    grade: 5,
    unit: 1,
  },
  {
    id: "4",
    word: "innovative",
    pronunciation: "/ˈɪnəveɪtɪv/",
    meaning: "혁신적인",
    example: "The company launched an innovative new product.",
    exampleKorean: "그 회사는 혁신적인 신제품을 출시했습니다.",
    idiom: "think outside the box",
    idiomMeaning: "창의적으로 생각하다",
    memoryTip: "\"이노베이티브\" - 이노(이+노)=이 노래, 베이(베이)=베이스, 티브 → 이 노래 베이스가 혁신적이야!",
    level: "high",
    grade: 10,
    unit: 5,
  },
  {
    id: "5",
    word: "friendship",
    pronunciation: "/ˈfrendʃɪp/",
    meaning: "우정, 친구 관계",
    example: "True friendship is a precious gift.",
    exampleKorean: "진정한 우정은 소중한 선물입니다.",
    idiom: "a friend in need is a friend indeed",
    idiomMeaning: "어려울 때 친구가 진정한 친구",
    memoryTip: "\"프렌드십\" - 프렌드(friend)=친구, 십=열 명 → 친구 열 명이 있다 → 우정!",
    level: "elementary",
    grade: 4,
    unit: 2,
  },
  {
    id: "6",
    word: "atmosphere",
    pronunciation: "/ˈætməsfɪr/",
    meaning: "대기, 분위기",
    example: "The restaurant had a wonderful atmosphere.",
    exampleKorean: "그 레스토랑은 훌륭한 분위기를 가지고 있었습니다.",
    idiom: "in the air",
    idiomMeaning: "분위기가 감돌다",
    memoryTip: "\"앳모스피어\" - 앳(at)=~에서, 모스(모스)=모스부호처럼, 피어(fear)=두려움 → 공기에서 두려움이 모스부호처럼 → 대기, 분위기",
    level: "middle",
    grade: 7,
    unit: 4,
  },
  {
    id: "7",
    word: "courage",
    pronunciation: "/ˈkɜːrɪdʒ/",
    meaning: "용기",
    example: "It takes courage to speak the truth.",
    exampleKorean: "진실을 말하는 것은 용기가 필요합니다.",
    idiom: "take heart",
    idiomMeaning: "용기를 내다",
    memoryTip: "\"커리지\" - 커(커)=커피처럼 쓴, 리지(Lizzy)=리지가 용감하게 마신다 → 용기",
    level: "middle",
    grade: 9,
    unit: 1,
  },
  {
    id: "8",
    word: "environment",
    pronunciation: "/ɪnˈvaɪrənmənt/",
    meaning: "환경",
    example: "We must protect the environment.",
    exampleKorean: "우리는 환경을 보호해야 합니다.",
    idiom: "go green",
    idiomMeaning: "친환경적으로 행동하다",
    memoryTip: "\"인바이런먼트\" - 인(in)=안에, 바이(by)=옆에, 런(run)=달리는, 먼트=먼지 → 안에서 옆에 달리는 먼지 → 환경",
    level: "elementary",
    grade: 6,
    unit: 3,
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

export const POPULAR_WORDS = ["perseverance", "abundant", "innovative", "courage", "environment"];

export const getWordsByLevel = (level: "elementary" | "middle" | "high") =>
  MOCK_WORDS.filter((w) => w.level === level);

export const getWordsByGradeAndUnit = (grade: number, unit: number) =>
  MOCK_WORDS.filter((w) => w.grade === grade && w.unit === unit);

export const getWordById = (id: string) => MOCK_WORDS.find((w) => w.id === id);
