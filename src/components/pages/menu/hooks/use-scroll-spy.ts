import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';

/**
 * The last section, in order, whose top is at or above `line`. Null while
 * every section is still below it. A section not yet measured ends the scan:
 * nothing after it can be placed either.
 */
export const sectionAt = (
  line: number,
  ids: readonly string[],
  tops: Readonly<Record<string, number>>,
): string | null => {
  let current: string | null = null;
  for (const id of ids) {
    const top = tops[id];
    if (top == null || top > line) break;
    current = id;
  }
  return current;
};

/**
 * Scroll-spy for a ScrollView of sections under a sticky tab rail.
 *
 * Positions are measured with onLayout rather than computed, because rows
 * vary in height (descriptions wrap, some dishes carry a portion line). Each
 * section reports its y inside the body; the body reports its y inside the
 * scroll content; the rail reports its height. A section is "stuck" once its
 * top has scrolled up to the rail's bottom edge.
 *
 * `pinnedId` covers the end of the list: the last few sections are too short
 * to scroll up to the rail, so after jumping to one the geometry would name an
 * earlier section. The tab that was tapped stays lit until the user drags.
 */
export const useScrollSpy = (ids: readonly string[]) => {
  const scrollRef = useRef<ScrollView>(null);
  const idsRef = useRef(ids);
  const scrollY = useRef(0);
  const bodyY = useRef(0);
  const tops = useRef<Record<string, number>>({});
  const railHeightRef = useRef(0);

  const [railHeight, setRailHeight] = useState(0);
  const [stuckId, setStuckId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  const spy = useCallback(() => {
    // +1 so a section parked exactly at the rail's edge — where jumpTo()
    // leaves it — counts as under the rail.
    const line = scrollY.current + railHeightRef.current + 1 - bodyY.current;
    setStuckId(sectionAt(line, idsRef.current, tops.current));
  }, []);

  // A filter change re-lays the body; the sections that survive re-report
  // through onLayout, but the order to scan them in changes here.
  useEffect(() => {
    idsRef.current = ids;
    spy();
  }, [ids, spy]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.current = e.nativeEvent.contentOffset.y;
      spy();
    },
    [spy],
  );

  const onScrollBeginDrag = useCallback(() => setPinnedId(null), []);

  const onRailLayout = useCallback(
    (e: LayoutChangeEvent) => {
      railHeightRef.current = e.nativeEvent.layout.height;
      setRailHeight(e.nativeEvent.layout.height);
      spy();
    },
    [spy],
  );

  const onBodyLayout = useCallback(
    (e: LayoutChangeEvent) => {
      bodyY.current = e.nativeEvent.layout.y;
      spy();
    },
    [spy],
  );

  const onSectionLayout = useCallback(
    (id: string, e: LayoutChangeEvent) => {
      tops.current[id] = e.nativeEvent.layout.y;
      spy();
    },
    [spy],
  );

  /**
   * Parks the section's header right under the rail. Instant rather than
   * animated: an animated scroll sweeps the spy through every section in
   * between, and the rail chases each one.
   */
  const jumpTo = useCallback((id: string) => {
    const top = tops.current[id];
    if (top == null) return;
    setPinnedId(id);
    scrollRef.current?.scrollTo({
      y: Math.max(0, bodyY.current + top - railHeightRef.current),
      animated: false,
    });
  }, []);

  const pinned = pinnedId != null && ids.includes(pinnedId) ? pinnedId : null;

  return {
    scrollRef,
    /** The section whose header is held under the rail; null above the first. */
    stuckId,
    /** The tab to light: the one tapped, else the one scrolled to. */
    activeId: pinned ?? stuckId ?? ids[0] ?? null,
    railHeight,
    onScroll,
    onScrollBeginDrag,
    onRailLayout,
    onBodyLayout,
    onSectionLayout,
    jumpTo,
  };
};
