export function dateToString(date: Date) {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

export function dateToStringWithTime(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1; // Monate beginnen bei 0
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // führende Null bei einstelligen Zahlen
  const formattedDay = day < 10 ? `0${day}` : `${day}`;
  const formattedMonth = month < 10 ? `0${month}` : `${month}`;
  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${formattedDay}.${formattedMonth}.${year} ${formattedHours}:${formattedMinutes}`;
}
