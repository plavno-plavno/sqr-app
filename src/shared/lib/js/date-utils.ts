export function formatDateForGroup(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Reset time to compare only dates
  const compareDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const compareToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const compareYesterday = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate()
  );

  if (compareDate.getTime() === compareToday.getTime()) {
    return "Today";
  } else if (compareDate.getTime() === compareYesterday.getTime()) {
    return "Yesterday";
  } else {
    // Format as "day month" (e.g., "15 January")
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    });
  }
}
