import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Platform, Animated, Text, LayoutChangeEvent, Pressable, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

// Particle system configuration
const PARTICLE_COUNT = 12;
const PARTICLE_COLORS = [
  colors.primary[400],
  colors.primary[500],
  colors.primary[600],
  '#FFD700', // Gold accent
  'rgba(255, 255, 255, 0.9)',
];

// Noise function for organic randomness
const noise = (n = 1) => n / 2 - Math.random() * n;

// Get radial position for particle
const getRadialXY = (distance: number, pointIndex: number, totalPoints: number): [number, number] => {
  const angle = ((360 + noise(8)) / totalPoints * pointIndex) * Math.PI / 180;
  const x = distance * Math.cos(angle);
  const y = distance * Math.sin(angle);
  return [x, y];
};

// Single particle component
interface ParticleProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  scale: number;
  color: string;
  rotation: number;
  delay: number;
  onComplete: () => void;
}

const Particle: React.FC<ParticleProps> = ({
  startX, startY, endX, endY, duration, scale, color, rotation, delay, onComplete
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(progress, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: duration * 0.2,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration * 0.8,
            delay: duration * 0.1,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onComplete();
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [startX, endX],
  });

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [startY, endY],
  });

  const particleScale = progress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.3, scale, 0],
  });

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${rotation}deg`],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          opacity,
          transform: [
            { translateX },
            { translateY },
            { scale: particleScale },
            { rotate },
          ],
        },
      ]}
    >
      <View style={[styles.particleInner, { backgroundColor: color }]} />
    </Animated.View>
  );
};

// Particle burst container
interface ParticleBurstProps {
  active: boolean;
  centerX: number;
  centerY: number;
  onComplete: () => void;
}

const ParticleBurst: React.FC<ParticleBurstProps> = ({ active, centerX, centerY, onComplete }) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    duration: number;
    scale: number;
    color: string;
    rotation: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    if (active) {
      const minDistance = 15;
      const maxDistance = 45;
      const baseTime = 500;
      const timeVariance = 200;

      const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const [startX, startY] = getRadialXY(minDistance, PARTICLE_COUNT - i, PARTICLE_COUNT);
        const [endX, endY] = getRadialXY(maxDistance + noise(12), PARTICLE_COUNT - i, PARTICLE_COUNT);
        const rotateNoise = noise(10);

        return {
          id: Date.now() + i,
          startX,
          startY,
          endX,
          endY,
          duration: baseTime + noise(timeVariance * 2),
          scale: 1 + noise(0.4),
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
          rotation: rotateNoise > 0 ? (rotateNoise + 5) * 20 : (rotateNoise - 5) * 20,
          delay: Math.random() * 50,
        };
      });

      setParticles(newParticles);
    }
  }, [active]);

  const handleParticleComplete = useCallback((id: number) => {
    setParticles(prev => {
      const remaining = prev.filter(p => p.id !== id);
      // Use setTimeout to avoid setState during render
      if (remaining.length === 0) {
        setTimeout(() => onComplete(), 0);
      }
      return remaining;
    });
  }, [onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <View style={[styles.particleBurstContainer, { left: centerX, top: centerY }]}>
      {particles.map(particle => (
        <Particle
          key={particle.id}
          {...particle}
          onComplete={() => handleParticleComplete(particle.id)}
        />
      ))}
    </View>
  );
};

interface GlassTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const getIconName = (routeName: string, isFocused: boolean): string => {
  const icons: Record<string, { active: string; inactive: string }> = {
    Home: { active: 'home', inactive: 'home-outline' },
    Cart: { active: 'cart', inactive: 'cart-outline' },
    Profile: { active: 'account-circle', inactive: 'account-circle-outline' },
  };
  return icons[routeName]?.[isFocused ? 'active' : 'inactive'] || 'help-circle';
};

interface TabItemProps {
  iconName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
  badgeCount?: number;
  tintColor: string;
  lensCoverage: number; // 0-1 how much the icon is under the lens
  isDragging: boolean;
}

const TabItem: React.FC<TabItemProps> = ({
  iconName,
  isFocused,
  onPress,
  onLongPress,
  onLayout,
  badgeCount,
  tintColor,
  lensCoverage,
  isDragging,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  // Lens magnification effect based on coverage
  useEffect(() => {
    if (isDragging) {
      // Scale based on lens coverage (more coverage = more zoom)
      const targetScale = 1 + (lensCoverage * 0.35); // Up to 1.35x zoom
      Animated.spring(scaleAnim, {
        toValue: targetScale,
        friction: 8,
        tension: 300,
        useNativeDriver: true,
      }).start();

      // Color transition based on coverage
      Animated.timing(colorAnim, {
        toValue: lensCoverage,
        duration: 50,
        useNativeDriver: false,
      }).start();
    } else if (!isPressed) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(colorAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [lensCoverage, isDragging, isFocused, isPressed]);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      friction: 4,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  // Interpolate color based on lens coverage
  const iconColor = colorAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [colors.neutral[400], colors.primary[400], tintColor],
  });

  return (
    <Pressable
      style={styles.tabItem}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLayout={onLayout}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Animated.Text style={{ color: iconColor }}>
          <MaterialCommunityIcons
            name={iconName as any}
            size={26}
            color={isFocused || lensCoverage > 0.3 ? tintColor : colors.neutral[400]}
          />
        </Animated.Text>
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 9 ? '9+' : badgeCount}
            </Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

// Liquid Glass Slider with lens/magnifying effect and prismatic refraction
const LiquidGlassSlider: React.FC<{
  position: Animated.Value;
  scaleX: Animated.Value;
  scaleY: Animated.Value;
  lensScale: Animated.Value;
  tintColor: string;
  isDragging: boolean;
}> = ({ position, scaleX, scaleY, lensScale, tintColor, isDragging }) => {
  // Shimmer animation for specular highlight
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  // Rainbow prismatic animation
  const prismaticAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerLoop.start();
    return () => shimmerLoop.stop();
  }, []);

  // Prismatic rainbow effect when dragging
  useEffect(() => {
    if (isDragging) {
      const prismaticLoop = Animated.loop(
        Animated.timing(prismaticAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      prismaticLoop.start();
      return () => prismaticLoop.stop();
    } else {
      prismaticAnim.setValue(0);
    }
  }, [isDragging]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 50],
  });

  const prismaticTranslate = prismaticAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-84, 84],
  });

  const prismaticOpacity = isDragging ? 0.6 : 0;

  return (
    <Animated.View
      style={[
        styles.liquidSlider,
        {
          transform: [
            { translateX: position },
            { scaleX: Animated.multiply(scaleX, lensScale) },
            { scaleY: Animated.multiply(scaleY, lensScale) },
          ],
        },
      ]}
    >
      {/* Base blur layer - creates the frosted glass lens */}
      <BlurView
        intensity={Platform.OS === 'ios' ? (isDragging ? 50 : 35) : (isDragging ? 80 : 65)}
        tint="light"
        style={StyleSheet.absoluteFill}
      />

      {/* Glass material with color tint */}
      <LinearGradient
        colors={[
          `rgba(255, 255, 255, 0.92)`,
          `rgba(255, 255, 255, 0.75)`,
          `rgba(255, 255, 255, 0.85)`,
        ]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Prismatic rainbow refraction effect - like light through a lens */}
      <Animated.View
        style={[
          styles.prismaticContainer,
          {
            opacity: prismaticOpacity,
            transform: [{ translateX: prismaticTranslate }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 0, 0, 0.15)',
            'rgba(255, 165, 0, 0.2)',
            'rgba(255, 255, 0, 0.2)',
            'rgba(0, 255, 0, 0.15)',
            'rgba(0, 191, 255, 0.2)',
            'rgba(138, 43, 226, 0.15)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Color tint overlay */}
      <View style={[styles.colorTint, { backgroundColor: `${tintColor}${isDragging ? '20' : '10'}` }]} />

      {/* Top specular rim - bright highlight like lens edge */}
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 1)',
          'rgba(255, 255, 255, 0.6)',
          'rgba(255, 255, 255, 0)',
        ]}
        locations={[0, 0.25, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.topSpecularRim}
      />

      {/* Bottom specular - lens curvature reflection */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(255, 255, 255, 0.3)',
          'rgba(255, 255, 255, 0.5)',
        ]}
        locations={[0, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.bottomSpecularRim}
      />

      {/* Animated shimmer - moving light reflex */}
      <Animated.View
        style={[
          styles.shimmer,
          { transform: [{ translateX: shimmerTranslate }] },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.8)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Secondary prismatic edge highlights */}
      <View style={styles.prismaticEdgeLeft} />
      <View style={styles.prismaticEdgeRight} />

      {/* Inner shadow layers for depth */}
      <View style={styles.innerShadowTop} />
      <View style={styles.innerShadowBottom} />

      {/* Outer glass border with multiple layers */}
      <View style={styles.glassBorderOuter} />
      <View style={styles.glassBorderInner} />
    </Animated.View>
  );
};

export const GlassTabBar: React.FC<GlassTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, spacing.sm);

  // Animation values
  const sliderPosition = useRef(new Animated.Value(0)).current;
  const sliderScaleX = useRef(new Animated.Value(1)).current;
  const sliderScaleY = useRef(new Animated.Value(1)).current;
  const lensScale = useRef(new Animated.Value(1)).current;

  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTabIndex, setHoverTabIndex] = useState(-1);

  // Particle burst state
  const [particleBurst, setParticleBurst] = useState<{
    active: boolean;
    centerX: number;
    centerY: number;
    key: number;
  }>({ active: false, centerX: 0, centerY: 0, key: 0 });

  // Trigger particle burst at tab position
  const triggerParticleBurst = useCallback((tabIndex: number, layouts = tabLayouts) => {
    if (layouts[tabIndex]) {
      const layout = layouts[tabIndex];
      const centerX = layout.x + layout.width / 2;
      const centerY = 35; // Center of tab bar height
      setParticleBurst({
        active: true,
        centerX,
        centerY,
        key: Date.now(),
      });
    }
  }, [tabLayouts]);

  // Ref for particle trigger to use in PanResponder
  const triggerParticleBurstRef = useRef(triggerParticleBurst);
  useEffect(() => {
    triggerParticleBurstRef.current = triggerParticleBurst;
  }, [triggerParticleBurst]);

  // Track current slider position for lens coverage calculation
  const [sliderX, setSliderX] = useState(0);
  const sliderWidth = 84;

  // Track current position for gesture handling
  const currentPosition = useRef(0);
  const dragStartX = useRef(0);
  const gestureStartSliderX = useRef(0);
  const containerRef = useRef<View>(null);

  // Use ref to avoid stale closure in PanResponder
  const tabLayoutsRef = useRef<{ x: number; width: number }[]>([]);
  const stateIndexRef = useRef(state.index);

  // Keep refs in sync
  useEffect(() => {
    tabLayoutsRef.current = tabLayouts;
  }, [tabLayouts]);

  useEffect(() => {
    stateIndexRef.current = state.index;
  }, [state.index]);

  // Get tab center position (slider position so icon is centered)
  const getTabCenterX = (index: number, layouts = tabLayoutsRef.current) => {
    if (!layouts[index]) return 0;
    return layouts[index].x + (layouts[index].width / 2) - (sliderWidth / 2);
  };

  // Calculate how much of each tab's icon is covered by the lens (0-1)
  const calculateLensCoverage = (tabIndex: number): number => {
    if (!tabLayouts[tabIndex]) return 0;

    const tab = tabLayouts[tabIndex];
    const tabCenterX = tab.x + tab.width / 2;
    const sliderCenterX = sliderX + sliderWidth / 2;

    // Distance from slider center to tab center
    const distance = Math.abs(sliderCenterX - tabCenterX);
    const maxDistance = sliderWidth / 2 + 20; // Coverage radius

    if (distance > maxDistance) return 0;

    // Smooth falloff: 1 at center, 0 at edge
    const coverage = 1 - (distance / maxDistance);
    return Math.max(0, Math.min(1, coverage * coverage)); // Quadratic falloff for smoother effect
  };

  // Find which tab the slider center is over
  const getTabAtSliderPosition = (sliderPosX: number, layouts = tabLayoutsRef.current): number => {
    const sliderCenterX = sliderPosX + sliderWidth / 2;
    for (let i = 0; i < layouts.length; i++) {
      const tab = layouts[i];
      if (tab && sliderCenterX >= tab.x && sliderCenterX <= tab.x + tab.width) {
        return i;
      }
    }
    return -1;
  };

  // Ref for hover tab index to avoid stale closure
  const hoverTabIndexRef = useRef(-1);
  const sliderXRef = useRef(0);

  // Pan responder for gesture-based sliding - improved precision
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 3;
      },
      onPanResponderGrant: (evt) => {
        setIsDragging(true);

        // Store the starting position of the drag
        dragStartX.current = evt.nativeEvent.pageX;
        gestureStartSliderX.current = currentPosition.current;

        // Lens zoom effect when grabbing
        Animated.spring(lensScale, {
          toValue: 1.12,
          friction: 8,
          tension: 250,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (evt, gestureState) => {
        const layouts = tabLayoutsRef.current;
        if (layouts.length === 0) return;

        // Calculate new position based on drag delta
        const dragDelta = gestureState.dx;
        let newPosition = gestureStartSliderX.current + dragDelta;

        // Clamp position to valid range with rubber band effect at edges
        const minPos = getTabCenterX(0, layouts);
        const maxPos = getTabCenterX(layouts.length - 1, layouts);

        if (newPosition < minPos) {
          // Rubber band effect at left edge
          const overflow = minPos - newPosition;
          newPosition = minPos - overflow * 0.3;
        } else if (newPosition > maxPos) {
          // Rubber band effect at right edge
          const overflow = newPosition - maxPos;
          newPosition = maxPos + overflow * 0.3;
        }

        // Update slider position
        sliderPosition.setValue(newPosition);
        currentPosition.current = newPosition;
        sliderXRef.current = newPosition;
        setSliderX(newPosition);

        // Calculate stretch based on velocity
        const velocity = Math.abs(gestureState.vx);
        const stretchAmount = 1 + Math.min(velocity * 0.08, 0.25);

        // Apply smooth stretch effect based on velocity
        if (velocity > 0.3) {
          Animated.timing(sliderScaleX, {
            toValue: stretchAmount,
            duration: 50,
            useNativeDriver: true,
          }).start();
          Animated.timing(sliderScaleY, {
            toValue: 1 - (stretchAmount - 1) * 0.25,
            duration: 50,
            useNativeDriver: true,
          }).start();
        } else {
          // Gradually return to normal
          Animated.timing(sliderScaleX, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }).start();
          Animated.timing(sliderScaleY, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }).start();
        }

        // Find which tab the slider is currently over
        const tabIndex = getTabAtSliderPosition(newPosition, layouts);

        // Update hover state for lens pulse effect
        if (tabIndex !== hoverTabIndexRef.current && tabIndex >= 0) {
          hoverTabIndexRef.current = tabIndex;
          setHoverTabIndex(tabIndex);

          // Pulse lens effect when entering new tab
          Animated.sequence([
            Animated.spring(lensScale, {
              toValue: 1.18,
              friction: 6,
              tension: 350,
              useNativeDriver: true,
            }),
            Animated.spring(lensScale, {
              toValue: 1.12,
              friction: 8,
              tension: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        setIsDragging(false);
        hoverTabIndexRef.current = -1;
        setHoverTabIndex(-1);

        const layouts = tabLayoutsRef.current;
        const currentIndex = stateIndexRef.current;

        // Find which tab to snap to based on current slider position
        let nearestTab = getTabAtSliderPosition(currentPosition.current, layouts);

        // If not directly over a tab, find the closest one
        if (nearestTab < 0) {
          let minDistance = Infinity;
          const sliderCenterX = currentPosition.current + sliderWidth / 2;
          for (let i = 0; i < layouts.length; i++) {
            const tabCenter = layouts[i].x + layouts[i].width / 2;
            const distance = Math.abs(sliderCenterX - tabCenter);
            if (distance < minDistance) {
              minDistance = distance;
              nearestTab = i;
            }
          }
        }

        // Consider velocity for flick gestures
        if (Math.abs(gestureState.vx) > 0.8) {
          const flickDirection = gestureState.vx > 0 ? 1 : -1;
          const potentialTab = nearestTab + flickDirection;
          if (potentialTab >= 0 && potentialTab < layouts.length) {
            nearestTab = potentialTab;
          }
        }

        // Navigate to the target tab
        if (nearestTab >= 0 && nearestTab !== currentIndex) {
          navigation.navigate(state.routes[nearestTab].name);
        }

        // Animate back to normal with bounce
        const targetX = getTabCenterX(nearestTab >= 0 ? nearestTab : currentIndex, layouts);

        // Multi-phase bounce animation for satisfying feel
        Animated.parallel([
          // Position snap with overshoot
          Animated.spring(sliderPosition, {
            toValue: targetX,
            friction: 5,
            tension: 80,
            useNativeDriver: true,
          }),
          // Lens scale bounce
          Animated.sequence([
            Animated.spring(lensScale, {
              toValue: 1.08,
              friction: 4,
              tension: 200,
              useNativeDriver: true,
            }),
            Animated.spring(lensScale, {
              toValue: 1,
              friction: 6,
              tension: 150,
              useNativeDriver: true,
            }),
          ]),
          // Scale X bounce
          Animated.sequence([
            Animated.spring(sliderScaleX, {
              toValue: 0.92,
              friction: 4,
              tension: 250,
              useNativeDriver: true,
            }),
            Animated.spring(sliderScaleX, {
              toValue: 1.06,
              friction: 5,
              tension: 200,
              useNativeDriver: true,
            }),
            Animated.spring(sliderScaleX, {
              toValue: 1,
              friction: 6,
              tension: 150,
              useNativeDriver: true,
            }),
          ]),
          // Scale Y inverse bounce
          Animated.sequence([
            Animated.spring(sliderScaleY, {
              toValue: 1.1,
              friction: 4,
              tension: 250,
              useNativeDriver: true,
            }),
            Animated.spring(sliderScaleY, {
              toValue: 0.96,
              friction: 5,
              tension: 200,
              useNativeDriver: true,
            }),
            Animated.spring(sliderScaleY, {
              toValue: 1,
              friction: 6,
              tension: 150,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          currentPosition.current = targetX;
          setSliderX(targetX);
        });
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        hoverTabIndexRef.current = -1;
        setHoverTabIndex(-1);

        const layouts = tabLayoutsRef.current;
        const currentIndex = stateIndexRef.current;

        // Reset to current tab
        const targetX = getTabCenterX(currentIndex, layouts);
        Animated.parallel([
          Animated.spring(sliderPosition, {
            toValue: targetX,
            friction: 6,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.spring(lensScale, {
            toValue: 1,
            friction: 6,
            tension: 150,
            useNativeDriver: true,
          }),
          Animated.spring(sliderScaleX, {
            toValue: 1,
            friction: 5,
            tension: 150,
            useNativeDriver: true,
          }),
          Animated.spring(sliderScaleY, {
            toValue: 1,
            friction: 5,
            tension: 150,
            useNativeDriver: true,
          }),
        ]).start(() => {
          currentPosition.current = targetX;
          setSliderX(targetX);
        });
      },
    })
  ).current;

  // Direction-aware morphing animation (for tap-based navigation)
  useEffect(() => {
    if (isDragging) return; // Skip if dragging

    if (tabLayouts.length === state.routes.length && tabLayouts[state.index]) {
      const targetX = getTabCenterX(state.index);

      if (!isInitialized) {
        sliderPosition.setValue(targetX);
        currentPosition.current = targetX;
        setSliderX(targetX);
        setIsInitialized(true);
        setPreviousIndex(state.index);
        return;
      }

      // Calculate stretch based on distance
      const distance = Math.abs(state.index - previousIndex);
      const stretchAmount = 1 + (distance * 0.15);

      // Liquid morphing sequence with direction awareness
      Animated.sequence([
        // Phase 1: Stretch in movement direction
        Animated.parallel([
          Animated.timing(sliderScaleX, {
            toValue: stretchAmount,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(sliderScaleY, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        // Phase 2: Move while stretched
        Animated.parallel([
          Animated.spring(sliderPosition, {
            toValue: targetX,
            friction: 7,
            tension: 90,
            useNativeDriver: true,
          }),
          // Phase 3: Bounce back with overshoot
          Animated.sequence([
            Animated.delay(80),
            Animated.spring(sliderScaleX, {
              toValue: 0.85,
              friction: 4,
              tension: 250,
              useNativeDriver: true,
            }),
            Animated.spring(sliderScaleX, {
              toValue: 1.05,
              friction: 5,
              tension: 200,
              useNativeDriver: true,
            }),
            Animated.spring(sliderScaleX, {
              toValue: 1,
              friction: 6,
              tension: 150,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(80),
            Animated.spring(sliderScaleY, {
              toValue: 1.08,
              friction: 4,
              tension: 250,
              useNativeDriver: true,
            }),
            Animated.spring(sliderScaleY, {
              toValue: 0.97,
              friction: 5,
              tension: 200,
              useNativeDriver: true,
            }),
            Animated.spring(sliderScaleY, {
              toValue: 1,
              friction: 6,
              tension: 150,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        currentPosition.current = targetX;
        setSliderX(targetX);
      });

      // Trigger particle burst when changing tabs
      if (state.index !== previousIndex) {
        triggerParticleBurst(state.index);
      }

      setPreviousIndex(state.index);
    }
  }, [state.index, tabLayouts, isInitialized, isDragging, triggerParticleBurst]);

  const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts(prev => {
      const newLayouts = [...prev];
      newLayouts[index] = { x, width };
      return newLayouts;
    });
  };

  const tintColor = colors.primary[600];

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      {/* Multi-layer shadow for depth */}
      <View style={styles.shadowLayer1} />
      <View style={styles.shadowLayer2} />

      {/* Main glass container with pan gesture */}
      <Animated.View
        ref={containerRef}
        {...panResponder.panHandlers}
        style={styles.gestureContainer}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 80 : 100}
          tint="light"
          style={styles.blurContainer}
        >
          {/* Background glass gradient */}
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.65)',
              'rgba(255, 255, 255, 0.35)',
              'rgba(255, 255, 255, 0.45)',
            ]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Top specular highlight */}
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.95)',
              'rgba(255, 255, 255, 0.3)',
              'rgba(255, 255, 255, 0)',
            ]}
            locations={[0, 0.15, 0.5]}
            style={styles.containerTopHighlight}
          />

          {/* Bottom subtle shadow */}
          <LinearGradient
            colors={[
              'transparent',
              'rgba(0, 0, 0, 0.03)',
            ]}
            style={styles.containerBottomShadow}
          />

          {/* Liquid Glass Slider */}
          {isInitialized && (
            <LiquidGlassSlider
              position={sliderPosition}
              scaleX={sliderScaleX}
              scaleY={sliderScaleY}
              lensScale={lensScale}
              tintColor={tintColor}
              isDragging={isDragging}
            />
          )}

          {/* Particle Burst Effect */}
          <ParticleBurst
            key={particleBurst.key}
            active={particleBurst.active}
            centerX={particleBurst.centerX}
            centerY={particleBurst.centerY}
            onComplete={() => setParticleBurst(prev => ({ ...prev, active: false }))}
          />

          {/* Tab items */}
          <View style={styles.tabContainer}>
            {state.routes.map((route: any, index: number) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;
              const iconName = getIconName(route.name, isFocused);
              const badgeCount = options.tabBarBadge;
              const lensCoverage = isDragging ? calculateLensCoverage(index) : (isFocused ? 1 : 0);

              return (
                <TabItem
                  key={route.key}
                  iconName={iconName}
                  isFocused={isFocused}
                  tintColor={tintColor}
                  lensCoverage={lensCoverage}
                  isDragging={isDragging}
                  onPress={() => {
                    const event = navigation.emit({
                      type: 'tabPress',
                      target: route.key,
                      canPreventDefault: true,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                      navigation.navigate(route.name);
                    }
                  }}
                  onLongPress={() => {
                    navigation.emit({
                      type: 'tabLongPress',
                      target: route.key,
                    });
                  }}
                  onLayout={(e) => handleTabLayout(index, e)}
                  badgeCount={badgeCount}
                />
              );
            })}
          </View>

          {/* Inner glass border */}
          <View style={styles.innerBorder} />
        </BlurView>

        {/* Outer specular border */}
        <View style={styles.outerBorder} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    zIndex: 100,
  },
  gestureContainer: {
    // Wrapper for pan gesture handling
  },
  // Multi-layer shadows like CSS example
  shadowLayer1: {
    position: 'absolute',
    bottom: spacing.sm + 3,
    left: spacing.lg + 3,
    right: spacing.lg + 3,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
    }),
  },
  shadowLayer2: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.lg,
    right: spacing.lg,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  blurContainer: {
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.88)',
  },
  containerTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 35,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  containerBottomShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  liquidSlider: {
    position: 'absolute',
    top: 10,
    left: 0,
    width: 84,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    zIndex: 1,
    // Multi-layer shadow like CSS
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 30, 63, 0.12)',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  colorTint: {
    ...StyleSheet.absoluteFillObject,
  },
  topSpecularRim: {
    position: 'absolute',
    top: 0,
    left: 2,
    right: 2,
    height: 25,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
  },
  bottomSpecularRim: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    right: 4,
    height: 18,
    borderBottomLeftRadius: 21,
    borderBottomRightRadius: 21,
  },
  prismaticContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: 25,
  },
  prismaticEdgeLeft: {
    position: 'absolute',
    left: 0,
    top: 5,
    bottom: 5,
    width: 3,
    backgroundColor: 'rgba(255, 100, 100, 0.15)',
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
  },
  prismaticEdgeRight: {
    position: 'absolute',
    right: 0,
    top: 5,
    bottom: 5,
    width: 3,
    backgroundColor: 'rgba(100, 100, 255, 0.15)',
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    left: '50%',
    marginLeft: -20,
    opacity: 0.6,
  },
  innerShadowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 15,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.08)',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
    }),
  },
  innerShadowBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  glassBorderOuter: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  glassBorderInner: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  tabContainer: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    zIndex: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.semantic.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.neutral[0],
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral[0],
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    margin: 1,
    pointerEvents: 'none',
  },
  outerBorder: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    height: 70,
    borderRadius: 35,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    pointerEvents: 'none',
  },
  // Particle burst styles
  particleBurstContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: 10,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 16,
    height: 16,
    marginLeft: -8,
    marginTop: -8,
  },
  particleInner: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
