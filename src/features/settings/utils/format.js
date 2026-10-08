export function formatPlace(place) {
  return [place?.city, place?.region, place?.country]
    .filter(Boolean)
    .join(', ');
}
