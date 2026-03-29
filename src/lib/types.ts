export interface Dimension {
  label: string;
  description: string;
}

export interface EssenceProfile {
  id?: string;
  user_id?: string;
  headline: string;
  dimensions: {
    volume: Dimension;
    texture: Dimension;
    opacity: Dimension;
    tactility: Dimension;
    weight: Dimension;
    temperature: Dimension;
  };
  palette: string[];
  observation: string;
  firstQuestion: string;
  raw_images?: string[];
  created_at?: string;
}

export type InputType = "image" | "text" | "link" | "memo";

export interface ChatRequest {
  input: {
    type: InputType;
    content: string;
    url?: string;
  };
  essence: EssenceProfile | null;
  history: { role: string; content: string }[];
}

export interface DialogueMessage {
  message: string;
  type: "question" | "insight" | "connection";
  insight?: {
    text: string;
    tags: string[];
    connectedEssence?: string;
  };
}

export interface InsightLog {
  id?: string;
  text: string;
  tags: string[];
  connectedEssence?: string;
  sessionId?: string;
  createdAt?: string;
}

export interface TopographyCluster {
  id: string;
  label: string;
  height: number;
  insights: string[];
  keywords: string[];
}
