// Animation configs for React Native's built-in Animated API
// These configs use friction/tension instead of damping/stiffness

export const springConfigs = {
  gentle: {
    friction: 10,
    tension: 50,
  },
  snappy: {
    friction: 8,
    tension: 150,
  },
  bouncy: {
    friction: 5,
    tension: 120,
  },
  stiff: {
    friction: 12,
    tension: 200,
  },
};

export const timingConfigs = {
  fast: {
    duration: 200,
  },
  normal: {
    duration: 300,
  },
  slow: {
    duration: 500,
  },
};

export const staggerDelay = (index: number, baseDelay: number = 50): number => {
  return index * baseDelay;
};
