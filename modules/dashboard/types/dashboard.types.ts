export type WidgetSize = "small" | "medium" | "large";

export interface DashboardWidget {
  id: string;
  title: string;
  type: string;
  size: WidgetSize;
  data: any;
}

export interface DashboardState {
  widgets: DashboardWidget[];
  isEditing: boolean;
  lastUpdated: string;
}
