import { AtomEffect, atom } from "recoil";

const storageEffect =
  <T>(key: string, defaultVal?: any): AtomEffect<T> =>
  // @ts-ignore
  async ({ onSet, setSelf }) => {
    onSet(async newValue => {
      let obj = { [key]: newValue };
      await chrome.storage.local.set(obj);
    });

    setSelf((await chrome.storage.local.get(key))[key] || defaultVal);
  };

export const highlightColorAtom = atom<string>({
  default: "",
  key: "highlightColor",
  effects: [storageEffect("highlightColor", "#FFC0CB")],
});

export const highlightAtom = atom<boolean>({
  key: "highlight",
  default: false,
  effects: [storageEffect("highlight")],
});

export const largePreviewAtom = atom<boolean>({
  key: "largePreview",
  default: false,
  effects: [storageEffect("largePreview")],
});

export const showHovercardsAtom = atom<boolean>({
  key: "showHovercards",
  default: false,
  effects: [storageEffect("showHovercards")],
});
