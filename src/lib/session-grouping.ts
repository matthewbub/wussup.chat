import { ChatSession } from "@/types/chat";

// The Strategy interface
interface SessionGroupingStrategy {
  group(sessions: ChatSession[]): Record<string, ChatSession[]>;
}

// Concrete strategy implementation
export class TimeframeGroupingStrategy implements SessionGroupingStrategy {
  private readonly periodOrder = ["Today", "This Week", "This Month", "Older"];

  group(sessions: ChatSession[]): Record<string, ChatSession[]> {
    const grouped = this.createGroups(sessions);
    return this.sortGroups(grouped);
  }

  private createGroups(sessions: ChatSession[]): Record<string, ChatSession[]> {
    return sessions.reduce(
      (groups, session) => {
        const date = new Date(session.created_at);
        const period = this.determineTimePeriod(date);

        if (!groups[period]) groups[period] = [];
        groups[period].push(session);
        return groups;
      },
      {} as Record<string, ChatSession[]>
    );
  }

  private determineTimePeriod(date: Date): string {
    if (this.isToday(date)) return "Today";
    if (this.isThisWeek(date)) return "This Week";
    if (this.isThisMonth(date)) return "This Month";
    return "Older";
  }

  private sortGroups(groups: Record<string, ChatSession[]>): Record<string, ChatSession[]> {
    return this.periodOrder
      .filter((period) => groups[period]?.length)
      .reduce(
        (acc, period) => {
          acc[period] = groups[period].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          return acc;
        },
        {} as Record<string, ChatSession[]>
      );
  }

  // Date utility methods
  private isToday(date: Date): boolean {
    return date.toDateString() === new Date().toDateString();
  }

  private isThisWeek(date: Date): boolean {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    return date >= weekStart && !this.isToday(date);
  }

  private isThisMonth(date: Date): boolean {
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear() &&
      !this.isToday(date) &&
      !this.isThisWeek(date)
    );
  }
}
