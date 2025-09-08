// Utilities for saving, retrieving, and restoring versions of generations

const VERSIONS_KEY = 'generationVersions';

export function addVersion(generationId, generation, meta = {}) {
  const history = JSON.parse(localStorage.getItem(VERSIONS_KEY)) || {};
  if (!history[generationId]) history[generationId] = [];
  history[generationId].push({
    content: generation,
    date: new Date().toISOString(),
    ...meta
  });
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(history));
}

export function getVersions(generationId) {
  const history = JSON.parse(localStorage.getItem(VERSIONS_KEY)) || {};
  const arr = history[generationId] || [];
  return [...arr].reverse(); // Mostra mais recentes primeiro
}

export function clearVersions(generationId) {
  const history = JSON.parse(localStorage.getItem(VERSIONS_KEY)) || {};
  delete history[generationId];
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(history));
}

export function restoreVersion(generationId, idx) {
  const versions = getVersions(generationId);
  return versions[idx];
}
