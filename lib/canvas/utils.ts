export function generateUserId(): string {
  return `user_${Math.random().toString(36).substring(2, 11)}`;
}

export function generateStrokeId(): string {
  return `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function generateUserName(): string {
  const adjectives = ['Happy', 'Swift', 'Bright', 'Cool', 'Smart', 'Bold', 'Calm', 'Clever'];
  const nouns = ['Panda', 'Fox', 'Wolf', 'Eagle', 'Tiger', 'Bear', 'Lion', 'Owl'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
}

export function generateUserColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
