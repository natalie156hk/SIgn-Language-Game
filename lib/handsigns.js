import { Finger, FingerCurl, FingerDirection, GestureDescription } from "fingerpose";

function g(name, recipe) {
  const desc = new GestureDescription(name);
  for (const [fingerName, curl, weight, direction, dirWeight] of recipe) {
    let f;
    switch (fingerName) {
      case "Thumb": f = Finger.Thumb; break;
      case "Index": f = Finger.Index; break;
      case "Middle": f = Finger.Middle; break;
      case "Ring": f = Finger.Ring; break;
      case "Pinky": f = Finger.Pinky; break;
    }
    desc.addCurl(f, curl, weight);
    if (direction) desc.addDirection(f, direction, dirWeight || 0.7);
  }
  return desc;
}

export const aSign = g("A", [
  ["Thumb", FingerCurl.NoCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Index", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Middle", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Ring", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Pinky", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp]
]);

export const bSign = g("B", [
  ["Thumb", FingerCurl.HalfCurl, 1.0, FingerDirection.DiagonalUpLeft],
  ["Index", FingerCurl.NoCurl, 1.0, FingerDirection.VerticalUp],
  ["Middle", FingerCurl.NoCurl, 1.0, FingerDirection.VerticalUp],
  ["Ring", FingerCurl.NoCurl, 1.0, FingerDirection.VerticalUp],
  ["Pinky", FingerCurl.NoCurl, 1.0, FingerDirection.VerticalUp]
]);

export const cSign = g("C", [
  ["Thumb", FingerCurl.NoCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Index", FingerCurl.NoCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Middle", FingerCurl.HalfCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Ring", FingerCurl.HalfCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Pinky", FingerCurl.HalfCurl, 1.0, FingerDirection.DiagonalUpRight]
]);

export const dSign = g("D", [
  ["Thumb", FingerCurl.HalfCurl, 1.0, FingerDirection.VerticalUp],
  ["Index", FingerCurl.NoCurl, 1.0, FingerDirection.VerticalUp],
  ["Middle", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Ring", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Pinky", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp]
]);

export const eSign = g("E", [
  ["Thumb", FingerCurl.HalfCurl, 1.0, FingerDirection.VerticalUp],
  ["Index", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Middle", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Ring", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Pinky", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp]
]);

export const fSign = g("F", [
  ["Thumb", FingerCurl.HalfCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Index", FingerCurl.FullCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Middle", FingerCurl.NoCurl, 1.0, FingerDirection.VerticalUp],
  ["Ring", FingerCurl.NoCurl, 1.0, FingerDirection.VerticalUp],
  ["Pinky", FingerCurl.NoCurl, 1.0, FingerDirection.VerticalUp]
]);

export const gSign = g("G", [
  ["Thumb", FingerCurl.NoCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Index", FingerCurl.NoCurl, 1.0, FingerDirection.HorizontalRight],
  ["Middle", FingerCurl.FullCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Ring", FingerCurl.FullCurl, 1.0, FingerDirection.HorizontalRight],
  ["Pinky", FingerCurl.FullCurl, 1.0, FingerDirection.HorizontalRight]
]);

export const hSign = g("H", [
  ["Thumb", FingerCurl.NoCurl, 1.0, FingerDirection.HorizontalRight],
  ["Index", FingerCurl.NoCurl, 1.0, FingerDirection.HorizontalRight],
  ["Middle", FingerCurl.NoCurl, 1.0, FingerDirection.HorizontalRight],
  ["Ring", FingerCurl.FullCurl, 1.0, FingerDirection.HorizontalRight],
  ["Pinky", FingerCurl.FullCurl, 1.0, FingerDirection.HorizontalRight]
]);

export const iSign = g("I", [
  ["Thumb", FingerCurl.HalfCurl, 1.0, FingerDirection.DiagonalUpLeft],
  ["Index", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Middle", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Ring", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Pinky", FingerCurl.NoCurl, 1.0, FingerDirection.VerticalUp]
]);

export const lSign = g("L", [
  ["Thumb", FingerCurl.NoCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Index", FingerCurl.NoCurl, 1.0, FingerDirection.VerticalUp],
  ["Middle", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Ring", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Pinky", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp]
]);

export const oSign = g("O", [
  ["Thumb", FingerCurl.NoCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Index", FingerCurl.HalfCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Middle", FingerCurl.HalfCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Ring", FingerCurl.FullCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Pinky", FingerCurl.FullCurl, 1.0, FingerDirection.DiagonalUpRight]
]);

export const uSign = g("U", [
  ["Thumb", FingerCurl.HalfCurl, 1.0, FingerDirection.DiagonalUpLeft],
  ["Index", FingerCurl.NoCurl, 1.0, FingerDirection.VerticalUp],
  ["Middle", FingerCurl.NoCurl, 1.0, FingerDirection.VerticalUp],
  ["Ring", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Pinky", FingerCurl.FullCurl, 1.0, FingerDirection.DiagonalUpLeft]
]);

export const vSign = g("V", [
  ["Thumb", FingerCurl.HalfCurl, 1.0, FingerDirection.DiagonalUpLeft],
  ["Index", FingerCurl.NoCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Middle", FingerCurl.NoCurl, 1.0, FingerDirection.VerticalUp],
  ["Ring", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Pinky", FingerCurl.FullCurl, 1.0, FingerDirection.DiagonalUpLeft]
]);

export const wSign = g("W", [
  ["Thumb", FingerCurl.HalfCurl, 1.0, FingerDirection.DiagonalUpLeft],
  ["Index", FingerCurl.NoCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Middle", FingerCurl.NoCurl, 1.0, FingerDirection.VerticalUp],
  ["Ring", FingerCurl.NoCurl, 1.0, FingerDirection.DiagonalUpLeft],
  ["Pinky", FingerCurl.FullCurl, 1.0, FingerDirection.DiagonalUpLeft]
]);

export const ySign = g("Y", [
  ["Thumb", FingerCurl.NoCurl, 1.0, FingerDirection.DiagonalUpRight],
  ["Index", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Middle", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Ring", FingerCurl.FullCurl, 1.0, FingerDirection.VerticalUp],
  ["Pinky", FingerCurl.NoCurl, 1.0, FingerDirection.DiagonalUpLeft]
]);
