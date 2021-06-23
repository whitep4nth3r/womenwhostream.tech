export function sortStreamers(a, b) {
  if (a.streamData !== null && b.streamData !== null) {
    // if both live, highest viewers first
    return b.streamData.viewer_count - a.streamData.viewer_count;
  } else if (a.streamData !== null && b.streamData === null) {
    // if a live
    return -1;
  } else if (b.streamData !== null && a.streamData === null) {
    // if b live
    return 1;
  } else if (a.vodData !== null && b.vodData !== null) {
    // order by most recently published VOD
    const a_timestamp = Date.parse(a.vodData.published_at);
    const a_date = new Date(a_timestamp);

    const b_timestamp = Date.parse(b.vodData.published_at);
    const b_date = new Date(b_timestamp);

    return b_date - a_date;
  } else {
    return 0;
  }
}

export async function waitFor(seconds) {
  return await new Promise(res => setTimeout(res, seconds * 1000));
}