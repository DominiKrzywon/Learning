export interface LessonModel {
  id: number;
  title: string;
  type: 'video' | 'reading' | 'quiz';
  duration: string;
  completed: boolean;
  content: VideoContent | ReadingContent | QuizContent;
}

export interface VideoContent {
  videoUrl: string;
  transcript: string;
}

export interface ReadingContent {
  text: string;
  resources: string[];
}

export interface QuizContent {
  questions: Array<{
    question: string;
    options: string[];
    correct: number;
  }>;
}
