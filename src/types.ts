export interface Automation {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "marketing" | "development" | "productivity" | "content";
  systemInstruction: string;
  executionType?: "manual" | "scheduled";
  scheduleDetails?: string;
  fields: AutomationField[];
}

export interface AutomationField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
}

export interface ExecutionHistory {
  id: string;
  automationId: string;
  automationTitle: string;
  timestamp: number;
  request: Record<string, any>;
  response: string;
}
