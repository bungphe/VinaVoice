export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export enum ReadingStyle {
  Natural = 'natural',
  Storytelling = 'storytelling',
  News = 'news',
  Expressive = 'expressive',
  Inspiring = 'inspiring'
}

export interface VoiceOption {
  id: VoiceName;
  name: string;
  gender: 'Nam' | 'Nữ';
  description: string;
}

export interface StyleOption {
  id: ReadingStyle;
  name: string;
  description: string;
  promptPrefix: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: VoiceName.Kore, name: 'Kore', gender: 'Nữ', description: 'Nhẹ nhàng, êm dịu' },
  { id: VoiceName.Puck, name: 'Puck', gender: 'Nam', description: 'Hóm hỉnh, năng động' },
  { id: VoiceName.Charon, name: 'Charon', gender: 'Nam', description: 'Trầm ấm, sâu lắng' },
  { id: VoiceName.Fenrir, name: 'Fenrir', gender: 'Nam', description: 'Mạnh mẽ, dứt khoát' },
  { id: VoiceName.Zephyr, name: 'Zephyr', gender: 'Nữ', description: 'Trong trẻo, hiện đại' },
];

export const STYLE_OPTIONS: StyleOption[] = [
  { 
    id: ReadingStyle.Expressive, 
    name: 'Diễn cảm (AI tự phân tích)', 
    description: 'Phân tích ngữ cảnh để đọc đúng cảm xúc nhân vật',
    promptPrefix: 'Hãy phân tích kỹ ngữ cảnh và đọc văn bản sau một cách truyền cảm, ngắt nghỉ đúng nhịp, lên xuống giọng hợp lý và thể hiện đúng tâm trạng của nội dung:'
  },
  { 
    id: ReadingStyle.Storytelling, 
    name: 'Kể chuyện', 
    description: 'Giọng ấm áp, cuốn hút như kể chuyện cổ tích',
    promptPrefix: 'Hãy đọc văn bản sau với giọng kể chuyện chậm rãi, ấm áp và cuốn hút, như đang kể cho người nghe một câu chuyện thú vị:'
  },
  { 
    id: ReadingStyle.News, 
    name: 'Tin tức', 
    description: 'Chuyên nghiệp, rõ ràng, khách quan',
    promptPrefix: 'Hãy đọc văn bản sau với giọng điệu của một phát thanh viên tin tức chuyên nghiệp, rõ ràng, rành mạch và khách quan:'
  },
  { 
    id: ReadingStyle.Inspiring, 
    name: 'Hùng biện', 
    description: 'Mạnh mẽ, truyền cảm hứng',
    promptPrefix: 'Hãy đọc văn bản sau với giọng điệu hào hùng, mạnh mẽ và truyền cảm hứng:'
  },
  { 
    id: ReadingStyle.Natural, 
    name: 'Tự nhiên', 
    description: 'Đọc bình thường, không thêm hiệu ứng',
    promptPrefix: ''
  },
];