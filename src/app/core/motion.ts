import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin);
gsap.defaults({ ease: 'power3.out', duration: 0.9 });

export { gsap, ScrollTrigger, SplitText, Flip };

/** true si la persona pidió reducir las animaciones en su sistema. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** true en pantallas táctiles (sin cursor). */
export function isTouch(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
}
