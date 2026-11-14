export type LessonBlock =
  | { type: "text"; body: string }
  | { type: "code"; code: string; runnable: boolean; output?: string }
  | { type: "pitfall"; body: string }
  | { type: "recap"; items: string[] }

export interface TestCase {
  input: string
  expected: string
  hidden: boolean
}

export interface Problem {
  id: string
  title: string
  statement: string
  difficulty: 1 | 2
  starter: string
  solution: string
  explanation: string
  hints: [string, string, string]
  tests: TestCase[]
}

export type QuizQuestion = {
  id: string
  question: string
  options: string[]
  answer: number
  explanation: string
}

export interface Stage {
  id: string
  order: number
  slug: string
  title: string
  week: number
  course: string
  summary: string
  estimatedMinutes: number
  concepts: string[]
  prerequisites: string[]
  objectives: string[]
  lesson: LessonBlock[]
  problems: Problem[]
  quiz: QuizQuestion[]
  status: "published" | "draft"
}
