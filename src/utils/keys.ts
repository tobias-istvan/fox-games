export const W = 'w';
export const A = 'a';
export const S = 's';
export const D = 'd';
export const ARROWUP = 'arrowup';
export const ARROWDOWN = 'arrowdown';
export const ARROWLEFT = 'arrowleft';
export const ARROWRIGHT = 'arrowright';
export const SPACE = 'space';
export const SHIFT = 'shift';
export const ALT = 'alt';
export const CTRL = 'ctrl';
export const DIRECTIONS = [W, A, S, D, ARROWDOWN, ARROWLEFT, ARROWRIGHT, ARROWUP];
export const DIRECTION_FORWARD = [W, ARROWUP];
export const DIRECTION_BACKWARD = [S, ARROWDOWN];
export const DIRECTION_LEFT = [A, ARROWLEFT];
export const DIRECTION_RIGHT = [D, ARROWRIGHT];
export const MODIFIERS = [SHIFT, ALT, CTRL];
export const KEYS = [...DIRECTIONS, ...MODIFIERS];
