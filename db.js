// Общий код для фоновой страницы и плеера (один origin -> общее хранилище).
export const ch = new BroadcastChannel("obr-music");

// Метаданные (названия, плейлисты) — localStorage
export const load = () => {
  try { return JSON.parse(localStorage.getItem("lib")) ?? { tracks: [], playlists: [] }; }
  catch { return { tracks: [], playlists: [] }; }
};
export const save = (lib) => localStorage.setItem("lib", JSON.stringify(lib));

// Сами аудиофайлы — IndexedDB
const open = () => new Promise((res, rej) => {
  const r = indexedDB.open("obr-music", 1);
  r.onupgradeneeded = () => r.result.createObjectStore("blobs", { keyPath: "id" });
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});
const run = async (mode, fn) => {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction("blobs", mode);
    const req = fn(t.objectStore("blobs"));
    t.oncomplete = () => res(req.result);
    t.onerror = () => rej(t.error);
  });
};
export const putBlob = (id, blob) => run("readwrite", (s) => s.put({ id, blob }));
export const getBlob = (id) => run("readonly", (s) => s.get(id));
export const delBlob = (id) => run("readwrite", (s) => s.delete(id));
