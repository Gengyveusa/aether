// In-memory store for demo (replace with Supabase queries in production)

import type { MusicRequest, MusicVersion, MusicComment, MusicPublished } from "./types";

const musicRequests: MusicRequest[] = [];
const musicVersions: MusicVersion[] = [];
const musicComments: MusicComment[] = [];
const publishedTracks: MusicPublished[] = [];

export function getMusicRequests() {
  return musicRequests;
}

export function getMusicVersions() {
  return musicVersions;
}

export function getMusicComments() {
  return musicComments;
}

export function getPublishedTracks() {
  return publishedTracks;
}
