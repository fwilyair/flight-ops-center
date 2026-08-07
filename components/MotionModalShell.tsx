import React from 'react';
import { gsap } from '../motion/gsap';
import { prefersReducedMotion, REDUCED_MOTION_QUERY } from '../motion/preferences';
import { MOTION_DURATION, MOTION_EASE, MOTION_STAGGER } from '../motion/tokens';
import { shouldCloseWithEscape } from './keyboardPolicy';
import type { KeyboardDismissSurface } from './keyboardPolicy';

interface MotionModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  ariaLabel: string;
  containerClassName?: string;
  backdropClassName?: string;
  panelClassName: string;
  keyboardDismissSurface?: KeyboardDismissSurface;
  children: React.ReactNode;
}

const getModalContent = (panel: HTMLDivElement): HTMLElement[] =>
  Array.from(panel.querySelectorAll<HTMLElement>('[data-motion-modal-content]'));

export const MotionModalShell: React.FC<MotionModalShellProps> = ({
  isOpen,
  onClose,
  ariaLabel,
  containerClassName = '',
  backdropClassName = 'bg-black/60 backdrop-blur-sm',
  panelClassName,
  keyboardDismissSurface,
  children,
}) => {
  const [mounted, setMounted] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const timelineRef = React.useRef<gsap.core.Timeline | null>(null);
  const contextRef = React.useRef<gsap.Context | null>(null);
  const initializedPanelRef = React.useRef<HTMLDivElement | null>(null);
  const generationRef = React.useRef(0);
  const closeRequestedRef = React.useRef(false);
  const reducedMotionRef = React.useRef(false);
  const componentMountedRef = React.useRef(true);
  const isOpenRef = React.useRef(isOpen);

  isOpenRef.current = isOpen;

  const requestClose = React.useCallback(() => {
    if (!isOpenRef.current || closeRequestedRef.current) return;

    closeRequestedRef.current = true;
    onClose();
  }, [onClose]);

  React.useLayoutEffect(() => {
    componentMountedRef.current = true;

    return () => {
      componentMountedRef.current = false;
      generationRef.current += 1;
      timelineRef.current?.kill();
      timelineRef.current = null;
    };
  }, []);

  React.useLayoutEffect(() => {
    if (isOpen) {
      closeRequestedRef.current = false;
      if (!mounted) setMounted(true);
    }
  }, [isOpen, mounted]);

  React.useEffect(() => {
    if (!mounted || !keyboardDismissSurface) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldCloseWithEscape(keyboardDismissSurface, event.key)) requestClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardDismissSurface, mounted, requestClose]);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!mounted || !root || !backdrop || !panel) return;

    const content = getModalContent(panel);
    const reducedMotionMedia = window.matchMedia(REDUCED_MOTION_QUERY);
    let disposed = false;

    initializedPanelRef.current = panel;
    reducedMotionRef.current = prefersReducedMotion();
    contextRef.current = gsap.context(() => {
      gsap.set(backdrop, { autoAlpha: 0 });
      gsap.set(panel, { autoAlpha: 0, y: 10, scale: 0.97 });
      gsap.set(content, { autoAlpha: 0, y: 6 });
    }, root);

    const landAtCurrentState = () => {
      const currentContent = getModalContent(panel);
      generationRef.current += 1;
      timelineRef.current?.kill();
      timelineRef.current = null;
      gsap.killTweensOf([backdrop, panel, ...currentContent]);

      if (isOpenRef.current) {
        contextRef.current?.add(() => {
          gsap.set(backdrop, { autoAlpha: 1 });
          gsap.set(panel, { autoAlpha: 1, y: 0, scale: 1 });
          gsap.set(currentContent, { autoAlpha: 1, y: 0 });
        });
        return;
      }

      contextRef.current?.add(() => {
        gsap.set(backdrop, { autoAlpha: 0 });
        gsap.set(panel, { autoAlpha: 0, y: 6, scale: 0.98 });
        gsap.set(currentContent, { autoAlpha: 0, y: 6 });
      });
      if (!disposed && componentMountedRef.current) setMounted(false);
    };

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      landAtCurrentState();
    };

    reducedMotionMedia.addEventListener('change', handleReducedMotionChange);

    return () => {
      disposed = true;
      reducedMotionMedia.removeEventListener('change', handleReducedMotionChange);
      generationRef.current += 1;
      timelineRef.current?.kill();
      timelineRef.current = null;
      gsap.killTweensOf([backdrop, panel, ...content]);
      contextRef.current?.revert();
      contextRef.current = null;
      if (initializedPanelRef.current === panel) initializedPanelRef.current = null;
    };
  }, [mounted]);

  React.useLayoutEffect(() => {
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!mounted || !backdrop || !panel || initializedPanelRef.current !== panel) return;

    const content = getModalContent(panel);
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    timelineRef.current?.kill();
    timelineRef.current = null;
    gsap.killTweensOf([backdrop, panel, ...content]);

    if (reducedMotionRef.current) {
      if (isOpen) {
        contextRef.current?.add(() => {
          gsap.set(backdrop, { autoAlpha: 1 });
          gsap.set(panel, { autoAlpha: 1, y: 0, scale: 1 });
          gsap.set(content, { autoAlpha: 1, y: 0 });
        });
      } else {
        contextRef.current?.add(() => {
          gsap.set(backdrop, { autoAlpha: 0 });
          gsap.set(panel, { autoAlpha: 0, y: 6, scale: 0.98 });
          gsap.set(content, { autoAlpha: 0, y: 6 });
        });
        if (componentMountedRef.current) setMounted(false);
      }
      return;
    }

    let timeline: gsap.core.Timeline | null = null;
    contextRef.current?.add(() => {
      timeline = gsap.timeline({ defaults: { overwrite: true } });

      if (isOpen) {
        timeline
          .to(backdrop, {
            autoAlpha: 1,
            duration: MOTION_DURATION.fast,
            ease: MOTION_EASE.standard,
          }, 0)
          .to(panel, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: MOTION_DURATION.modalIn,
            ease: MOTION_EASE.layout,
          }, 0)
          .to(content, {
            autoAlpha: 1,
            y: 0,
            duration: MOTION_DURATION.fast,
            ease: MOTION_EASE.standard,
            stagger: MOTION_STAGGER.layer,
          }, 0.08);
        return;
      }

      timeline
        .to(panel, {
          autoAlpha: 0,
          y: 6,
          scale: 0.98,
          duration: MOTION_DURATION.modalOut,
          ease: MOTION_EASE.exit,
        }, 0)
        .to(backdrop, {
          autoAlpha: 0,
          duration: MOTION_DURATION.fast,
          ease: MOTION_EASE.exit,
        }, 0.02)
        .eventCallback('onComplete', () => {
          if (
            generationRef.current !== generation ||
            isOpenRef.current ||
            !componentMountedRef.current
          ) return;

          setMounted(false);
        });
    });

    timelineRef.current = timeline;

    return () => {
      timeline?.kill();
      if (timelineRef.current === timeline) timelineRef.current = null;
    };
  }, [isOpen, mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      className={`fixed inset-0 z-[100] flex items-center justify-center ${containerClassName}`}
      role="dialog"
      aria-modal={isOpen ? true : undefined}
      aria-hidden={isOpen ? undefined : true}
      aria-label={ariaLabel}
    >
      <div
        ref={backdropRef}
        className={`absolute inset-0 ${backdropClassName}`}
        onClick={requestClose}
      />
      <div ref={panelRef} className={`relative z-[1] ${panelClassName}`}>
        {children}
      </div>
    </div>
  );
};
